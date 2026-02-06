"use client";

import React, { useState, useRef, useEffect, JSX } from "react";
import { useGeminiChat } from "./geminichat";
import { useVideoLecture } from "./videotutor";
import ThinkingIndicator from "./thinking";
import CodeEditBlock from "./codeEdit";
import VideoTutorModal from "../videotutor";
import {
  X,
  Bot,
  Sparkles,
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
}

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

const TutorBot: React.FC<TutorBotProps> = ({
  lessonContext,
  suggestedQuestions = [],
  moduleName,
  fileContent,
  fileName,
  onFileUpdate,
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

      console.log("Scroll Debug:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
        isOpen,
        scrollPromptDismissed,
        showScrollPrompt,
      });

      const isAtBottom = distanceFromBottom < 150;

      if (
        isAtBottom &&
        !isOpen &&
        !scrollPromptDismissed &&
        !showScrollPrompt
      ) {
        console.log("✅ At bottom! Starting timer...");

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        isScrolling = true;

        scrollTimeoutRef.current = setTimeout(() => {
          console.log("⏰ Timer complete! Showing prompt...");
          setShowScrollPrompt(true);
          isScrolling = false;
        }, 2000);
      } else if (!isAtBottom && scrollTimeoutRef.current) {
        console.log("❌ Scrolled away from bottom, canceling timer");
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
    console.log("🔄 Module/Lesson changed, resetting prompt state");
    setScrollPromptDismissed(false);
    setShowScrollPrompt(false);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [lessonContext, moduleName]);

  useEffect(() => {
    console.log("🎯 showScrollPrompt state changed to:", showScrollPrompt);
  }, [showScrollPrompt]);

  const handleAcceptScrollPrompt = () => {
    console.log("✅ User accepted scroll prompt");
    setShowScrollPrompt(false);
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
    console.log("❌ User dismissed scroll prompt");
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
      alert("Voice input not supported in this browser.");
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
          className="my-4 rounded-lg overflow-hidden border border-gray-700"
        >
          <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <button
              onClick={() => copyToClipboard(code, blockIndex)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700"
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
          <div className="bg-[#1e1e1e] p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100 font-mono leading-relaxed">
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
            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400 break-all"
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
          className="fixed bottom-24 left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 p-4 max-w-sm z-[100] animate-slideIn"
          style={{ zIndex: 100 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Finished reading?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Would you like me to quiz you on what you just learned to check
                your understanding?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptScrollPrompt}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Yes, quiz me!
                </button>
                <button
                  onClick={handleDismissScrollPrompt}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissScrollPrompt}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 bg-[#1e3a8a] text-white rounded-2xl shadow-2xl hover:bg-[#1e40af] transition-all flex items-center gap-2 group z-50"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Bot size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-semibold text-sm">
          AI Tutor
        </span>
      </button>

      {isOpen && (
        <div
          className={`fixed ${
            isExpanded
              ? "inset-4 w-auto h-auto"
              : "bottom-6 left-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px]"
          } bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col z-50 overflow-hidden transition-all duration-300`}
        >
          <div className="p-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    AI Tutor
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {thinkingLevel} thinking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    voiceEnabled
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={voiceEnabled ? "Voice ON" : "Voice OFF"}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                  className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                  className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {(["minimal", "low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThinkingLevel(level)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                    thinkingLevel === level
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            {voiceEnabled && (
              <label className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoListen}
                  onChange={(e) => setAutoListen(e.target.checked)}
                  className="rounded"
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
          />

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-white dark:bg-[#1e1e1e] min-h-0"
          >
            {cleanMessages.length === 0 && (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="text-white" size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    How can I help you today?
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                    Ask me anything about {moduleName}
                  </p>
                </div>
                {suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto px-4">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cleanMessages.map((m, i) => (
              <div key={i} className="flex gap-3 items-start">
                {m.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                )}

                <div
                  className={`flex-1 min-w-0 ${m.role === "user" ? "flex justify-end" : ""}`}
                >
                  <div
                    className={`inline-block max-w-[85%] ${
                      m.role === "user"
                        ? "bg-[#1a73e8] text-white px-4 py-2.5 rounded-2xl rounded-tr-md"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="text-sm leading-relaxed break-words">
                        {m.text}
                      </p>
                    ) : (
                      <div className="text-sm leading-relaxed overflow-hidden">
                        {renderMessageContent(m.text, i)}
                      </div>
                    )}
                  </div>
                  {m.codeEdit && (
                    <div className="mt-2">
                      <CodeEditBlock
                        codeEdit={m.codeEdit}
                        onApply={onFileUpdate ? applyCodeChange : undefined}
                        messageIndex={i}
                      />
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <ThinkingIndicator />
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-end gap-2">
              {voiceEnabled && (
                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`p-3 rounded-full transition-all flex-shrink-0 ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-3xl px-5 py-3 pr-12 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 resize-none"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim() || isListening}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
