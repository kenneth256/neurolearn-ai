import React, { useState, useRef, useEffect } from "react";
import { useGeminiChat } from "./geminichat";
import { useVideoLecture } from "./videotutor";
import ThinkingIndicator from "./thinking";
import CodeEditBlock from "./codeEdit";
import VideoTutorModal from "../videotutor";

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
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("medium");
  const [showVideoTutor, setShowVideoTutor] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported.");

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript, true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-amber-600 transition-all flex items-center gap-2 group z-50 border border-slate-700"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold uppercase tracking-widest text-xs">
          Ask Gemini 3
        </span>
      </button>

      {/* Main Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[28rem] h-[42rem] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 0 1 1h2a4 4 0 0 1 4 4v2a1 1 0 0 0 1 1 4 4 0 0 1 0 8 1 1 0 0 0-1 1v2a4 4 0 0 1-4 4h-2a1 1 0 0 0-1 1 4 4 0 0 1-8 0 1 1 0 0 0-1-1H5a4 4 0 0 1-4-4v-2a1 1 0 0 0-1-1 4 4 0 0 1 0-8 1 1 0 0 0 1-1V8a4 4 0 0 1 4-4h2a1 1 0 0 0 1-1 4 4 0 0 1 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold">Gemini 3 Tutor</h3>
                  <p className="text-[9px] text-slate-400 uppercase">
                    Level: {thinkingLevel}
                  </p>
                  {fileName && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      {fileName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateVideo}
                  className="hover:text-amber-500 p-2 transition-colors"
                  title="Generate Video Lecture"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-amber-500 p-2 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Thinking Level Selector */}
            <div className="flex bg-slate-800 p-0.5 rounded-full gap-0.5 border border-slate-700">
              {(["minimal", "low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThinkingLevel(level)}
                  className={`text-[7px] px-2 py-1 rounded-full transition-all uppercase font-black ${
                    thinkingLevel === level
                      ? "bg-amber-500 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Video Modal */}
          <VideoTutorModal
            showVideoTutor={showVideoTutor}
            isGeneratingVideo={isGeneratingVideo}
            currentVideoUrl={currentVideoUrl}
            videoScript={videoScript}
            onClose={handleCloseVideo}
            onReplayAudio={replayAudio}
          />

          {/* Chat Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
          >
            {messages.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <svg
                  className="mx-auto text-amber-400 animate-pulse"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="12 2 15 8.5 22 9.5 17 14.5 18 21.5 12 18 6 21.5 7 14.5 2 9.5 9 8.5" />
                </svg>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-500 transition-all text-slate-600 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={handleGenerateVideo}
                    className="text-xs p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Generate Video Lecture
                  </button>
                  {fileContent && (
                    <button
                      onClick={() =>
                        handleSend("Can you help me improve this code?")
                      }
                      className="text-xs p-3 bg-amber-50 border border-amber-300 rounded-xl hover:border-amber-500 transition-all text-amber-700 shadow-sm font-semibold"
                    >
                      💡 Improve my code
                    </button>
                  )}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] ${m.role === "model" ? "w-full" : ""}`}
                >
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.codeEdit && (
                    <CodeEditBlock
                      codeEdit={m.codeEdit}
                      onApply={onFileUpdate ? applyCodeChange : undefined}
                      messageIndex={i}
                    />
                  )}
                </div>
              </div>
            ))}

            {isThinking && <ThinkingIndicator />}
          </div>

          {/* Input Footer */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={startListening}
                className={`p-4 rounded-2xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {isListening ? (
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  ) : (
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  )}
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything or request code changes..."
                disabled={isThinking}
                className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim()}
                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-amber-600 transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TutorBot;
