"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Mic,
  Send,
  MicOff,
  X,
  Sparkles,
  MessageCircle,
  BrainCircuit,
} from "lucide-react";

interface TutorBotProps {
  lessonContext: string;
  suggestedQuestions?: string[];
  moduleName: string;
}

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

// --- Sub-component: Thinking Indicator ---
const ThinkingIndicator = () => {
  const thoughts = [
    "Analyzing lesson context...",
    "Synthesizing Gemini 3 logic...",
    "Structuring explanation...",
    "Refining pedagogical approach...",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % thoughts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-amber-500 rounded-full"
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[11px] font-medium text-slate-400 italic min-w-35"
          >
            {thoughts[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- Main Component: TutorBot ---
const TutorBot: React.FC<TutorBotProps> = ({
  lessonContext,
  suggestedQuestions,
  moduleName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("medium");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini 3 Session
  useEffect(() => {
    const initChat = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) return;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: `You are the NeuroLearn AI Tutor for "${moduleName}". 
        Context: "${lessonContext}".
        Use Gemini 3 reasoning to be deep yet concise. Avoid asterisks/markdown symbols. 
        Voice mode responses must be under 3 sentences.`,
        generationConfig: {
          //@ts-ignore
          thinkingConfig: {
            thinkingLevel: thinkingLevel,
            includeThoughts: false,
          },
        },
      });

      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      setChatSession(model.startChat({ history }));
    };

    initChat();
  }, [lessonContext, moduleName, thinkingLevel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isThinking]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

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
    if (!textToSend.trim() || isThinking) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setInput("");
    setIsThinking(true);

    try {
      const result = await chatSession.sendMessage(textToSend);
      const responseText = result.response.text();
      setMessages((prev) => [...prev, { role: "model", text: responseText }]);
      if (isVoice) speak(responseText);
    } catch (error) {
      console.error("Gemini 3 Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-amber-600 transition-all flex items-center gap-2 group z-50 border border-slate-700"
      >
        <MessageCircle size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          Ask Gemini 3
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-150 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Gemini 3 Tutor</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter">
                      Level: {thinkingLevel}
                    </p>
                  </div>
                </div>
                <div className="flex bg-slate-800 p-0.5 rounded-full gap-0.5 border border-slate-700">
                  {(["minimal", "low", "medium", "high"] as const).map(
                    (level) => (
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
                    ),
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-amber-500 p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
            >
              {messages.length === 0 && (
                <div className="text-center py-6 space-y-4">
                  <div className="flex justify-center">
                    <Sparkles className="text-amber-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Architected Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions?.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-[11px] p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-500 transition-all text-slate-600 shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}
                  >
                    {m.text}
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
                  className={`p-4 rounded-2xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600"}`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask the architect..."
                  disabled={isThinking}
                  className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isThinking}
                  className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-amber-600 transition-colors shadow-lg disabled:bg-slate-400"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorBot;
