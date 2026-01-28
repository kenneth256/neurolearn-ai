"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Trophy,
  Zap,
  Target,
  Award,
} from "lucide-react";

interface TutorBotProps {
  lessonContext: string;
  suggestedQuestions?: string[];
  moduleName: string;
  fileContent?: string;
  fileName?: string;
  onFileUpdate?: (newContent: string) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerHash: string;
  explanation: string;
  points: number;
}

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

interface SystemMessage {
  text: string;
  timestamp: number;
}

interface GameSession {
  active: boolean;
  currentQuestion: QuizQuestion | null;
  questionsAnswered: number;
  correctAnswers: number;
  totalPoints: number;
  streak: number;
  conceptTitle: string;
}

const hashAnswer = async (
  questionId: string,
  answerIndex: number,
): Promise<string> => {
  const data = `${questionId}-${answerIndex}-secret-salt-${Date.now().toString().slice(0, -3)}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

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
  const [autoListen, setAutoListen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [systemMessage, setSystemMessage] = useState<SystemMessage | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const attemptTracker = useRef<number[]>([]);

  // Gamification states
  const [gameSession, setGameSession] = useState<GameSession>({
    active: false,
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    totalPoints: 0,
    streak: 0,
    conceptTitle: "",
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observedSections = useRef<Set<string>>(new Set());

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

  const userInitiatedMessages = messages.filter(
    (m) => !m.text.startsWith("[System"),
  );

  // Generate quiz question based on concept
  const generateQuizQuestion = async (
    conceptTitle: string,
    conceptContent: string,
  ): Promise<QuizQuestion | null> => {
    const quizPrompt = `Based on the concept "${conceptTitle}", generate 10 challenging multiple-choice questions in this EXACT JSON format (no markdown, no extra text):

{
  "question": "Clear, specific question about the concept",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "Brief explanation of the correct answer"
}

Make it challenging but fair. Test understanding, not just memory.`;

    try {
      await sendMessage(quizPrompt, false);
      const response = messages[messages.length - 1]?.text || "";

      // Parse AI response
      let aiQuestion;
      try {
        // Try to extract JSON from markdown code blocks or raw JSON
        const jsonMatch =
          response.match(/```json\n([\s\S]*?)\n```/) ||
          response.match(/```\n([\s\S]*?)\n```/) ||
          response.match(/\{[\s\S]*\}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
        aiQuestion = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        console.error("Failed to parse AI response, using fallback question");

        aiQuestion = {
          question: `What is the main principle of ${conceptTitle}?`,
          options: [
            "Understanding the core concept and its practical applications",
            "Memorizing definitions without understanding context",
            "Skipping over important details and examples",
            "Ignoring the real-world applications",
          ],
          correctAnswerIndex: 0,
          explanation: `${conceptTitle} requires understanding core principles and their practical applications, not just memorization.`,
        };
      }

      const questionId = Date.now().toString();
      const originalCorrectIndex = aiQuestion.correctAnswerIndex;

      // ✅ Shuffle options to prevent pattern recognition
      const shuffledOptions = aiQuestion.options
        .map((opt: string, idx: number) => ({ opt, idx, sort: Math.random() }))
        .sort((a: any, b: any) => a.sort - b.sort);

      const newCorrectIndex = shuffledOptions.findIndex(
        (item: any) => item.idx === originalCorrectIndex,
      );

      const correctAnswerHash = await hashAnswer(questionId, newCorrectIndex);

      return {
        id: questionId,
        question: aiQuestion.question,
        options: shuffledOptions.map((s: any) => s.opt),
        correctAnswerHash, // ✅ Secure hash instead of plain answer
        explanation: aiQuestion.explanation,
        points: 10,
      };
    } catch (error) {
      console.error("Error generating quiz:", error);
      return null;
    }
  };

  const startGameSession = async (
    conceptTitle: string,
    conceptContent: string,
  ) => {
    if (!gamificationEnabled) return;

    const question = await generateQuizQuestion(conceptTitle, conceptContent);

    if (question) {
      setGameSession({
        active: true,
        currentQuestion: question,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalPoints: 0,
        streak: 0,
        conceptTitle,
      });

      if (voiceEnabled) {
        speakText(
          `Time for a quick knowledge check! ${question.question}`,
          true,
        );
      }
    }
  };

  const handleAnswerSelection = async (answerIndex: number) => {
    if (!gameSession.currentQuestion || showResult || isVerifying) return;

    // ✅ Rate limiting
    const now = Date.now();
    attemptTracker.current.push(now);
    attemptTracker.current = attemptTracker.current.filter(
      (time) => now - time < 60000, // Keep only last minute
    );

    if (attemptTracker.current.length > 15) {
      alert(
        "⚠️ Too many attempts detected! Please take your time to read the questions carefully.",
      );
      return;
    }

    setIsVerifying(true);
    setSelectedAnswer(answerIndex);

    try {
      // ✅ Verify answer by comparing hashes
      const userAnswerHash = await hashAnswer(
        gameSession.currentQuestion.id,
        answerIndex,
      );

      const correct =
        userAnswerHash === gameSession.currentQuestion.correctAnswerHash;

      setIsCorrect(correct);
      setShowResult(true);

      const newStreak = correct ? gameSession.streak + 1 : 0;
      const points = correct
        ? gameSession.currentQuestion.points * (1 + newStreak * 0.1)
        : 0;

      setGameSession((prev) => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalPoints: prev.totalPoints + points,
        streak: newStreak,
      }));

      if (voiceEnabled) {
        const resultText = correct
          ? `Correct! ${gameSession.currentQuestion.explanation}. You earned ${Math.round(points)} points!`
          : `Not quite. ${gameSession.currentQuestion.explanation}`;

        setTimeout(() => speakText(resultText, false), 500);
      }
    } catch (error) {
      console.error("Error verifying answer:", error);
      alert("Failed to verify answer. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const continueAfterQuiz = () => {
    setGameSession((prev) => ({
      ...prev,
      active: false,
      currentQuestion: null,
    }));
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const speakText = (text: string, isSystemMessage = false) => {
    if (!voiceEnabled || !text) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\[System[^\]]*\]:\s*/g, "")
      .replace(/```[\s\S]*?```/g, "Code block omitted")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/#+\s/g, "")
      .trim();

    if (isSystemMessage) {
      setSystemMessage({ text: cleanText, timestamp: Date.now() });
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.rate = 1.0;
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

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      if (autoListen && isOpen && !gameSession.active) {
        setTimeout(() => {
          startListening();
        }, 500);
      }

      if (isSystemMessage) {
        setTimeout(() => {
          setSystemMessage(null);
        }, 1000);
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      if (isSystemMessage) {
        setSystemMessage(null);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSystemMessage(null);
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === "model" &&
      voiceEnabled &&
      !isThinking &&
      !gameSession.active
    ) {
      const isSystem = lastMessage.text.startsWith("[System");
      speakText(lastMessage.text, isSystem);
    }
  }, [messages, voiceEnabled, isThinking, gameSession.active]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleUserActivity = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        if (isOpen && !isThinking && isInitialized && !gameSession.active) {
          sendMessage(
            "[System Nudge]: I noticed you've been on this section for a bit. Are you finding this concept challenging, or would you like a quick summary to move forward?",
            false,
          );
        }
      }, 45000);
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isOpen, isThinking, isInitialized, sendMessage, gameSession.active]);

  useEffect(() => {
    if (!isInitialized || !isOpen || !gamificationEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const conceptId = entry.target.getAttribute("data-concept-id");

          if (
            !entry.isIntersecting &&
            entry.boundingClientRect.top < 0 &&
            conceptId
          ) {
            if (!observedSections.current.has(conceptId)) {
              observedSections.current.add(conceptId);

              const conceptTitle =
                entry.target.getAttribute("data-concept-title") ||
                "the previous section";

              const conceptContent = entry.target.textContent || "";

              // Trigger gamified quiz
              setTimeout(() => {
                startGameSession(conceptTitle, conceptContent);
              }, 1000);
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    const blocks = document.querySelectorAll("[data-concept-block]");
    blocks.forEach((block) => observer.observe(block));

    return () => observer.disconnect();
  }, [isInitialized, isOpen, moduleName, gamificationEnabled]);

  useEffect(() => {
    if (scrollRef.current && !gameSession.active) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [userInitiatedMessages, isThinking, gameSession.active]);

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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript, true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl shadow-2xl hover:bg-amber-600 dark:hover:bg-amber-500 transition-all flex items-center gap-2 group z-50 border border-slate-700 dark:border-slate-300"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Bot size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold uppercase tracking-widest text-xs">
          Ask Gemini 3
        </span>
        {gameSession.totalPoints > 0 && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
            <Trophy size={16} />
          </div>
        )}
      </button>

      {systemMessage && !gameSession.active && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-scale-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-3xl shadow-2xl p-8 max-w-md border-4 border-amber-500 animate-pulse-border">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-amber-500 rounded-full animate-pulse">
                <Mic size={32} className="text-slate-900" />
              </div>
            </div>
            <p className="text-center text-lg font-medium leading-relaxed">
              {systemMessage.text}
            </p>
            {isListening && (
              <div className="mt-4 flex items-center justify-center gap-2 text-amber-400">
                <Mic size={20} className="animate-pulse" />
                <span className="text-sm font-bold">Listening...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gamified Quiz Overlay */}
      {gameSession.active && gameSession.currentQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-3xl shadow-2xl max-w-2xl w-full border-4 border-amber-500 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Target size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Knowledge Check!</h3>
                  <p className="text-sm opacity-90">
                    {gameSession.conceptTitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Trophy size={24} />
                  {Math.round(gameSession.totalPoints)}
                </div>
                <div className="text-xs opacity-90">
                  {gameSession.streak > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap size={12} /> {gameSession.streak}x Streak!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-amber-400 mb-2">
                  <Award size={16} />
                  <span>Worth {gameSession.currentQuestion.points} points</span>
                </div>
                <h4 className="text-xl font-semibold leading-relaxed">
                  {gameSession.currentQuestion.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {gameSession.currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const showCorrect = showResult && isCorrect && isSelected;
                  const showWrong = showResult && !isCorrect && isSelected;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelection(index)}
                      disabled={showResult || isVerifying}
                      className={`w-full p-4 rounded-xl text-left transition-all font-medium border-2 ${
                        showCorrect
                          ? "bg-green-500/30 border-green-400 shadow-lg shadow-green-500/50"
                          : showWrong
                            ? "bg-red-500/30 border-red-400 shadow-lg shadow-red-500/50"
                            : isSelected
                              ? "bg-amber-500/30 border-amber-400"
                              : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-amber-400"
                      } ${showResult || isVerifying ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            showCorrect
                              ? "bg-green-400 text-green-900"
                              : showWrong
                                ? "bg-red-400 text-red-900"
                                : "bg-white/20"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {showCorrect && <span className="text-2xl">✓</span>}
                        {showWrong && <span className="text-2xl">✗</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {isVerifying && (
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400 rounded-xl text-center">
                  <p className="text-sm">
                    🔐 Verifying your answer securely...
                  </p>
                </div>
              )}
              {/* Explanation */}
              {showResult && (
                <div
                  className={`mt-6 p-4 rounded-xl ${
                    isCorrect
                      ? "bg-green-500/20 border border-green-400"
                      : "bg-red-500/20 border border-red-400"
                  }`}
                >
                  <p className="font-semibold mb-2">
                    {isCorrect ? "🎉 Correct!" : "❌ Not quite right"}
                  </p>
                  <p className="text-sm opacity-90">
                    {gameSession.currentQuestion.explanation}
                  </p>
                  {isCorrect && gameSession.streak > 1 && (
                    <p className="text-sm mt-2 text-amber-400 font-bold">
                      🔥 {gameSession.streak}x Streak Bonus Applied!
                    </p>
                  )}
                </div>
              )}

              {/* Continue Button */}
              {showResult && (
                <button
                  onClick={continueAfterQuiz}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
                >
                  Continue Learning →
                </button>
              )}
            </div>

            {/* Stats Footer */}
            <div className="bg-black/30 p-4 flex justify-around text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-amber-400">
                  {gameSession.questionsAnswered}
                </div>
                <div className="text-xs opacity-75">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {gameSession.correctAnswers}
                </div>
                <div className="text-xs opacity-75">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {gameSession.questionsAnswered > 0
                    ? Math.round(
                        (gameSession.correctAnswers /
                          gameSession.questionsAnswered) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <div className="text-xs opacity-75">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden animate-fadeIn">
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white flex-shrink-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 dark:bg-amber-600 rounded-lg text-slate-900 dark:text-slate-100">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Gemini 3 Tutor</h3>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase">
                    Level: {thinkingLevel}
                  </p>
                  {fileName && (
                    <p className="text-xs text-amber-400 dark:text-amber-500 flex items-center gap-1 mt-1">
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
                  {gameSession.totalPoints > 0 && (
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <Trophy size={10} />
                      {Math.round(gameSession.totalPoints)} pts
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setGamificationEnabled(!gamificationEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    gamificationEnabled
                      ? "bg-green-500/20 text-green-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title={
                    gamificationEnabled ? "Gamification ON" : "Gamification OFF"
                  }
                >
                  <Target size={18} />
                </button>

                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    voiceEnabled
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title={voiceEnabled ? "Voice enabled" : "Voice disabled"}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <button
                  onClick={handleGenerateVideo}
                  className="hover:text-amber-500 dark:hover:text-amber-400 p-2 transition-colors"
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
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                    stopListening();
                  }}
                  className="hover:text-amber-500 dark:hover:text-amber-400 p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex bg-slate-800 dark:bg-slate-950 p-0.5 rounded-full gap-0.5 border border-slate-700 dark:border-slate-600 mb-2">
              {(["minimal", "low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThinkingLevel(level)}
                  className={`text-[7px] px-2 py-1 rounded-full transition-all uppercase font-black ${
                    thinkingLevel === level
                      ? "bg-amber-500 dark:bg-amber-600 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-slate-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoListen}
                onChange={(e) => setAutoListen(e.target.checked)}
                className="rounded"
              />
              Auto-activate mic after response
            </label>
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
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950 min-h-0 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-transparent"
          >
            {userInitiatedMessages.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <Sparkles
                  className="mx-auto text-amber-400 dark:text-amber-500 animate-pulse"
                  size={32}
                />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:hover:border-amber-600 transition-all text-slate-600 dark:text-slate-300 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={handleGenerateVideo}
                    className="text-xs p-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
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
                </div>
              </div>
            )}

            {userInitiatedMessages.map((m, i) => (
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
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-none"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
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

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`p-4 rounded-2xl transition-all ${
                  isListening
                    ? "bg-red-500 dark:bg-red-600 text-white animate-pulse"
                    : isSpeaking
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-amber-100 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400"
                }`}
                disabled={isSpeaking}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic size={20} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything or request code changes..."
                disabled={isThinking || isListening}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim() || isListening}
                className="p-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        @keyframes pulseBorder {
          0%, 100% { border-color: #f59e0b; }
          50% { border-color: #fbbf24; }
        }
        .animate-pulse-border {
          animation: pulseBorder 2s ease-in-out infinite;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #b45309;
        }
      `}</style>
    </>
  );
};

export default TutorBot;
