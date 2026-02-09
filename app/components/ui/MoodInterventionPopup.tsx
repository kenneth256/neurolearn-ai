"use client";

import React, { useState, useEffect } from "react";
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
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);

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
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {content.question?.text}
            </h4>

            <div className="space-y-3 mb-6">
              {content.question?.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === index
                      ? option.correct
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-500 bg-white dark:bg-gray-800"
                  } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">
                        {option.text}
                      </p>
                      {showFeedback && selectedAnswer === index && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm mt-2 text-gray-600 dark:text-gray-400"
                        >
                          {option.explanation}
                        </motion.p>
                      )}
                    </div>
                    {showFeedback && selectedAnswer === index && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {option.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
              >
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Was this helpful?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWasHelpful(true);
                      handleComplete(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes, helpful!
                  </button>
                  <button
                    onClick={() => {
                      setWasHelpful(false);
                      handleComplete(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Not really
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "ENCOURAGEMENT":
        return (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  You've got this! 💪
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {content.encouragement?.message}
                </p>
              </div>
            </div>

            {content.encouragement?.actionItems &&
              content.encouragement.actionItems.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-4">
                  <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Try these steps:
                  </h5>
                  <ul className="space-y-2">
                    {content.encouragement.actionItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-300"
                      >
                        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex gap-2">
              <button
                onClick={() => handleComplete(true)}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <ThumbsUp className="w-4 h-4 inline mr-2" />
                Feeling better!
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Still struggling
              </button>
            </div>
          </div>
        );

      case "HINT":
        return (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Here's a hint 💡
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {content.hint?.text}
                </p>
              </div>
            </div>

            {content.hint?.relatedConcepts &&
              content.hint.relatedConcepts.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                  <h5 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                    Related concepts to review:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {content.hint.relatedConcepts.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-full text-sm text-amber-800 dark:text-amber-300"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex gap-2">
              <button
                onClick={() => handleComplete(true)}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                That helps!
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Need more help
              </button>
            </div>
          </div>
        );

      case "CONTENT_SIMPLIFICATION":
        return (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Let's break this down
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {content.simplification?.simplifiedText}
                </p>
              </div>
            </div>

            {content.simplification?.keyPoints && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Key points:
                </h5>
                <ul className="space-y-2">
                  {content.simplification.keyPoints.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300"
                    >
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.simplification?.analogy && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-4">
                <h5 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Think of it like this:
                </h5>
                <p className="text-sm text-indigo-800 dark:text-indigo-300 italic">
                  {content.simplification.analogy}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleComplete(true)}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Makes sense now!
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Still confused
              </button>
            </div>
          </div>
        );

      case "BREAK_SUGGESTION":
        return (
          <div className="text-center">
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
              <Coffee className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Time for a break?
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You've been working hard! Taking a short break can help you come
              back refreshed and focused.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleComplete(true);
                  // TODO: Implement break timer
                }}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Take a 5-min break
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Continue learning
              </button>
            </div>
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    AI Learning Assistant
                  </h3>
                  <p className="text-sm text-indigo-100">
                    Personalized help based on how you're feeling
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">{renderContent()}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
