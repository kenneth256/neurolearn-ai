"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle,
  X,
  Lightbulb,
  AlertCircle,
  Coffee,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface InterventionData {
  id: string;
  type: string;
  content: {
    question?: {
      text: string;
      options: Array<{
        text: string;
        correct: boolean;
        explanation: string;
      }>;
      difficulty: string;
    };
    encouragement?: {
      message: string;
      actionItems: string[];
    };
    hint?: {
      level: string;
      text: string;
      relatedConcepts: string[];
    };
    simplification?: {
      simplifiedText: string;
      keyPoints: string[];
      analogy?: string;
    };
  };
  estimatedTime: number;
}

interface MoodInterventionPopupProps {
  intervention: InterventionData;
  onClose: () => void;
  onComplete: (response: any) => void;
}

export default function MoodInterventionPopup({
  intervention,
  onClose,
  onComplete,
}: MoodInterventionPopupProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  const handleComplete = (helpful: boolean) => {
    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    const response = {
      interventionId: intervention.id,
      userResponse: {
        selectedAnswer,
        correct:
          selectedAnswer !== null
            ? intervention.content.question?.options[selectedAnswer]?.correct
            : null,
        timestamp: new Date().toISOString(),
      },
      wasHelpful: helpful,
      responseTime,
    };
    onComplete(response);
  };

  const renderContent = () => {
    const { type, content } = intervention;

    switch (type) {
      case "ADAPTIVE_QUESTION":
        return (
          <div>
            <h4 className="text-xl font-serif italic text-slate-900 dark:text-slate-50 mb-6">
              {content.question?.text}
            </h4>
            <div className="space-y-3 mb-6 font-sans">
              {content.question?.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.01 }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === index
                      ? option.correct
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-white dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-slate-200">
                        {option.text}
                      </p>
                      {showFeedback && selectedAnswer === index && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm mt-2 text-slate-600 dark:text-slate-400 italic"
                        >
                          {option.explanation}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {showFeedback && <FeedbackActions onComplete={handleComplete} />}
          </div>
        );

      case "ENCOURAGEMENT":
        return (
          <div className="font-sans">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Brain className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h4 className="text-2xl font-serif text-slate-900 dark:text-white mb-2 italic">
                  You&apos;ve got this!
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {content.encouragement?.message}
                </p>
              </div>
            </div>
            {content.encouragement?.actionItems && (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
                <ul className="space-y-3">
                  {content.encouragement.actionItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FeedbackActions
              onComplete={handleComplete}
              positiveLabel="Feeling better!"
              negativeLabel="Still struggling"
            />
          </div>
        );

      case "HINT":
        return (
          <div className="font-sans">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Lightbulb className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h4 className="text-2xl font-serif text-slate-900 dark:text-white mb-2 italic">
                  A little insight...
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                  {content.hint?.text}
                </p>
              </div>
            </div>
            {content.hint?.relatedConcepts && (
              <div className="flex flex-wrap gap-2 mb-6">
                {content.hint.relatedConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 rounded-full text-xs font-mono text-amber-700 dark:text-amber-400"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            )}
            <FeedbackActions onComplete={handleComplete} />
          </div>
        );

      case "CONTENT_SIMPLIFICATION":
        return (
          <div className="font-sans">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <AlertCircle className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h4 className="text-2xl font-serif text-slate-900 dark:text-white mb-2 italic">
                  Simplified for you
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {content.simplification?.simplifiedText}
                </p>
              </div>
            </div>
            {content.simplification?.analogy && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 mb-6 italic text-slate-600 dark:text-slate-400">
                &quot;{content.simplification.analogy}&quot;
              </div>
            )}
            <FeedbackActions
              onComplete={handleComplete}
              positiveLabel="Makes sense!"
              negativeLabel="Still confused"
            />
          </div>
        );

      case "BREAK_SUGGESTION":
        return (
          <div className="text-center py-4 font-sans">
            <div className="inline-block p-5 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
              <Coffee className="w-12 h-12 text-amber-600" />
            </div>
            <h4 className="text-2xl font-serif text-slate-900 dark:text-white mb-3 italic">
              Time for a breather?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              A 5-minute pause can help reset your focus. You&apos;ve been doing
              great work.
            </p>
            <FeedbackActions
              onComplete={handleComplete}
              positiveLabel="Take a break"
              negativeLabel="Keep going"
              isBreak
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[#fcfcf9] dark:bg-[#020617] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Editorial Header */}
          <div className="bg-[#f59e0b] dark:bg-[#fbbf24] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Learning Assistant
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-900/60">
                    Tailored Intervention
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>

          <div className="p-8">{renderContent()}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sub-component for buttons to keep logic clean
function FeedbackActions({
  onComplete,
  positiveLabel = "That helps!",
  negativeLabel = "Not really",
  isBreak = false,
}: any) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onComplete(true)}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sans font-bold transition-all ${
          isBreak
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 hover:opacity-90"
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        {positiveLabel}
      </button>
      <button
        onClick={() => onComplete(false)}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl font-sans hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
      >
        <ThumbsDown className="w-4 h-4" />
        {negativeLabel}
      </button>
    </div>
  );
}
