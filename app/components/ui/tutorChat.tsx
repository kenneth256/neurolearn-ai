"use client";

import React, { useState, useRef, useEffect, JSX } from "react";
import { useGeminiChat } from "./geminichat";
import { useVideoLecture } from "./videotutor";
import ThinkingIndicator from "./thinking";
import CodeEditBlock from "./codeEdit";
import VideoTutorModal from "../videotutor";
import toast from "react-hot-toast";
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";

interface TutorBotProps {
  lessonContext: string;
  suggestedQuestions?: string[];
  moduleName: string;
  fileContent?: string;
  fileName?: string;
  onFileUpdate?: (newContent: string) => void;
  enrollmentId: string;
  lessonModuleId: string;
  timeSpentMinutes?: number;
}

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

const TutorBot: React.FC<TutorBotProps> = ({
  lessonContext,
  suggestedQuestions = [],
  moduleName,
  fileContent,
  fileName,
  onFileUpdate,
  enrollmentId,
  lessonModuleId,
  timeSpentMinutes = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("medium");
  const [showVideoTutor, setShowVideoTutor] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const [scrollPromptDismissed, setScrollPromptDismissed] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { messages, isThinking, sendMessage, setMessages, isInitialized } =
    useGeminiChat(
      lessonContext,
      moduleName,
      thinkingLevel,
      fileContent,
      fileName,
    );

  const {
    isGeneratingVideo,
    videoScript,
    currentVideoUrl,
    generateLecture,
    replayAudio,
  } = useVideoLecture(lessonContext, moduleName, fileContent);

  const cleanMessages = messages.filter((m) => !m.text.startsWith("[System"));

  useEffect(() => {
    let isScrolling = false;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      const isAtBottom = distanceFromBottom < 150;

      if (
        isAtBottom &&
        !isOpen &&
        !scrollPromptDismissed &&
        !showScrollPrompt
      ) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        isScrolling = true;

        scrollTimeoutRef.current = setTimeout(() => {
          setShowScrollPrompt(true);
          isScrolling = false;
        }, 2000);
      } else if (!isAtBottom && scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
        isScrolling = false;
      }

      lastScrollPositionRef.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen, scrollPromptDismissed, showScrollPrompt]);

  useEffect(() => {
    setScrollPromptDismissed(false);
    setShowScrollPrompt(false);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [lessonContext, moduleName]);

  const handleAcceptScrollPrompt = async () => {
    setShowScrollPrompt(false);

    const loadingToast = toast.loading("Completing lesson...");

    try {
      const response = await fetch("/api/courses/lesson/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId,
          lessonModuleId,
          timeSpentMinutes: timeSpentMinutes || 0,
          exercisesCompleted: 0,
          totalExercises: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          id: loadingToast,
          duration: 4000,
          icon: data.data.isModuleComplete ? "🎉" : "✅",
        });

        if (data.data.isModuleComplete) {
          setTimeout(() => {
            toast.success("Next module unlocked! Keep going! 🚀", {
              duration: 3000,
            });
          }, 500);
        }
      } else {
        toast.error(data.message || "Failed to complete lesson", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        id: loadingToast,
      });
      console.error("Error completing lesson:", error);
    }

    setScrollPromptDismissed(true);
    setIsOpen(true);

    setTimeout(() => {
      sendMessage(
        "I've just finished reading this section. Can you quiz me on what I've learned to check my understanding?",
        false,
      );
    }, 500);
  };

  const handleDismissScrollPrompt = () => {
    setShowScrollPrompt(false);
    setScrollPromptDismissed(true);
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !text) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Female") || voice.name.includes("Samantha")),
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (autoListen && isOpen) {
        setTimeout(startListening, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === "model" &&
      voiceEnabled &&
      !isThinking &&
      !lastMessage.text.startsWith("[System")
    ) {
      speakText(lastMessage.text);
    }
  }, [messages, voiceEnabled, isThinking]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cleanMessages, isThinking]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript, true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async (msgText?: string, isVoice = false) => {
    const textToSend = msgText || input;
    if (!textToSend.trim()) return;

    setInput("");
    await sendMessage(textToSend, isVoice);
  };

  const applyCodeChange = (newCode: string) => {
    if (onFileUpdate) {
      onFileUpdate(newCode);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "✅ Code changes applied successfully!" },
      ]);
    }
  };

  const handleGenerateVideo = () => {
    setShowVideoTutor(true);
    generateLecture();
  };

  const handleCloseVideo = () => {
    setShowVideoTutor(false);
    window.speechSynthesis.cancel();
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderMessageContent = (text: string, messageIndex: number) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        parts.push(
          <span
            key={`text-${messageIndex}-${blockIndex}`}
            className="whitespace-pre-wrap break-words"
          >
            {formatInlineCode(textBefore)}
          </span>,
        );
      }

      const language = match[1] || "text";
      const code = match[2];
      const codeId = `code-${messageIndex}-${blockIndex}`;

      parts.push(
        <div
          key={codeId}
          className="my-4 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700"
        >
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-300 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
              {language}
            </span>
            <button
              onClick={() => copyToClipboard(code, blockIndex)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {copiedCode === blockIndex ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-[#020617] p-4 overflow-x-auto">
            <pre className="text-sm text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        </div>,
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(
        <span
          key={`text-${messageIndex}-end`}
          className="whitespace-pre-wrap break-words"
        >
          {formatInlineCode(remainingText)}
        </span>,
      );
    }

    return parts.length > 0 ? (
      parts
    ) : (
      <span className="whitespace-pre-wrap break-words">
        {formatInlineCode(text)}
      </span>
    );
  };

  const formatInlineCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-[#fffbeb] dark:bg-amber-950/30 rounded text-sm font-mono text-[#d97706] dark:text-[#fbbf24] break-all border border-amber-200 dark:border-amber-800"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {showScrollPrompt && !isOpen && (
        <div
          className="fixed bottom-24 left-6 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border-2 border-[#f59e0b] dark:border-[#fbbf24] p-6 max-w-sm z-[100] animate-slideIn"
          style={{ zIndex: 100 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] flex items-center justify-center flex-shrink-0 shadow-lg">
              <BookOpen size={24} className="text-white dark:text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] text-base mb-2">
                Finished reading?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Would you like me to quiz you on what you just learned to check
                your understanding?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptScrollPrompt}
                  className="px-4 py-2 bg-[#f59e0b] dark:bg-[#fbbf24] hover:bg-[#d97706] dark:hover:bg-[#f59e0b] text-white dark:text-black text-sm font-semibold rounded-lg transition-colors shadow-md"
                >
                  Yes, quiz me!
                </button>
                <button
                  onClick={handleDismissScrollPrompt}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissScrollPrompt}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] text-white dark:text-black rounded-2xl shadow-2xl hover:shadow-amber-500/50 hover:from-[#d97706] hover:to-[#f59e0b] dark:hover:from-[#f59e0b] dark:hover:to-[#fbbf24] transition-all flex items-center gap-3 group z-50 border-2 border-[#d97706] dark:border-[#f59e0b]"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <BookOpen size={24} className="flex-shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-serif font-bold text-sm whitespace-nowrap">
          AI Tutor
        </span>
      </button>

      {isOpen && (
        <div
          className={`fixed ${
            isExpanded
              ? "inset-4 w-auto h-auto"
              : "bottom-6 left-6 w-[480px] max-w-[calc(100vw-3rem)] h-[650px]"
          } bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden transition-all duration-300`}
        >
          <div className="p-6 bg-gradient-to-r from-[#fffbeb] to-slate-50 dark:from-[#0f172a] dark:to-[#020617] border-b-2 border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] flex items-center justify-center flex-shrink-0 shadow-md">
                  <BookOpen size={20} className="text-white dark:text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] truncate">
                    AI Tutor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    {thinkingLevel} mode
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    voiceEnabled
                      ? "bg-[#fffbeb] dark:bg-amber-900/30 text-[#d97706] dark:text-[#fbbf24]"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={voiceEnabled ? "Voice ON" : "Voice OFF"}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </button>

                <button
                  onClick={handleGenerateVideo}
                  className="p-2 text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Generate Video"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsExpanded(false);
                    stopSpeaking();
                    stopListening();
                  }}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {(["minimal", "low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThinkingLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                    thinkingLevel === level
                      ? "bg-[#f59e0b] dark:bg-[#fbbf24] text-white dark:text-black shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {voiceEnabled && (
              <label className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={autoListen}
                  onChange={(e) => setAutoListen(e.target.checked)}
                  className="rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]"
                />
                Auto-listen after response
              </label>
            )}
          </div>

          <VideoTutorModal
            showVideoTutor={showVideoTutor}
            isGeneratingVideo={isGeneratingVideo}
            currentVideoUrl={currentVideoUrl}
            videoScript={videoScript}
            onClose={handleCloseVideo}
            onReplayAudio={replayAudio}
            userId=""
          />

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 bg-white dark:bg-[#0f172a] min-h-0"
          >
            {cleanMessages.length === 0 && (
              <div className="text-center py-16 space-y-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] flex items-center justify-center shadow-xl">
                  <BookOpen className="text-white dark:text-black" size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] mb-3">
                    How can I help you today?
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 px-6 leading-relaxed">
                    Ask me anything about{" "}
                    <span className="font-semibold text-[#f59e0b] dark:text-[#fbbf24]">
                      {moduleName}
                    </span>
                  </p>
                </div>
                {suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto px-4">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-[#fffbeb] hover:text-[#d97706] dark:hover:bg-slate-700 dark:hover:text-[#fbbf24] transition-all border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cleanMessages.map((m, i) => (
              <div key={i} className="flex gap-4 items-start">
                {m.role === "model" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] flex items-center justify-center flex-shrink-0 shadow-md">
                    <BookOpen
                      size={18}
                      className="text-white dark:text-black"
                    />
                  </div>
                )}

                <div
                  className={`flex-1 min-w-0 ${
                    m.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <div
                    className={`inline-block max-w-[85%] ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-[#020617] text-white px-5 py-3 rounded-2xl rounded-tr-md shadow-md border border-slate-600 dark:border-slate-700"
                        : "text-[#0f172a] dark:text-slate-200"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="text-sm leading-relaxed break-words font-medium">
                        {m.text}
                      </p>
                    ) : (
                      <div className="text-sm leading-relaxed overflow-hidden">
                        {renderMessageContent(m.text, i)}
                      </div>
                    )}
                  </div>
                  {m.codeEdit && (
                    <div className="mt-3">
                      <CodeEditBlock
                        codeEdit={m.codeEdit}
                        onApply={onFileUpdate ? applyCodeChange : undefined}
                        messageIndex={i}
                      />
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-slate-600 dark:text-slate-300"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] flex items-center justify-center shadow-md">
                  <BookOpen size={18} className="text-white dark:text-black" />
                </div>
                <ThinkingIndicator />
              </div>
            )}
          </div>

          <div className="p-5 bg-gradient-to-r from-slate-50 to-[#fffbeb]/30 dark:from-[#0f172a] dark:to-[#020617] border-t-2 border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-end gap-3">
              {voiceEnabled && (
                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 shadow-md ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={isListening ? "Stop" : "Voice input"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              <div className="flex-1 relative min-w-0">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  placeholder="Message AI Tutor..."
                  disabled={isThinking || isListening}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 pr-12 text-sm text-[#0f172a] dark:text-[#f8fafc] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#f59e0b] dark:focus:ring-[#fbbf24] focus:border-[#f59e0b] dark:focus:border-[#fbbf24] outline-none disabled:opacity-50 resize-none transition-all"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim() || isListening}
                className="p-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] text-white dark:text-black rounded-xl hover:from-[#d97706] hover:to-[#f59e0b] dark:hover:from-[#f59e0b] dark:hover:to-[#fbbf24] transition-all disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default TutorBot;
