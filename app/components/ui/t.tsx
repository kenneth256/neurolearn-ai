// components/InteractiveQuiz.tsx
"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: Question[];
  lessonTitle: string;
  onComplete?: (score: number) => void;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  lessonTitle,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<
    Array<{ correct: boolean; selected: number }>
  >([]);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    const correct = selectedAnswer === question.correctAnswer;

    setAnswers([...answers, { correct, selected: selectedAnswer }]);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete?.(score);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  };

  if (isComplete) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-50 dark:bg-amber-950/20 border-4 border-amber-500 dark:border-amber-600 rounded-2xl p-12 text-center shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div
            className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg ${
              passed ? "bg-amber-500" : "bg-slate-400 dark:bg-slate-600"
            }`}
          >
            {passed ? (
              <Award size={64} className="text-white" />
            ) : (
              <RotateCcw size={64} className="text-white" />
            )}
          </div>
        </div>

        <h3 className="text-4xl font-serif font-bold mb-4 text-gray-900 dark:text-white">
          {passed ? "Excellent Work!" : "Keep Practicing!"}
        </h3>

        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          You scored{" "}
          <span className="font-bold text-3xl text-amber-600 dark:text-amber-500 font-serif">
            {score}/{questions.length}
          </span>{" "}
          <span className="text-base">({Math.round(percentage)}%)</span>
        </p>

        <div className="space-y-4 mb-10">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border-2 ${
                answers[idx].correct
                  ? "bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    answers[idx].correct ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {answers[idx].correct ? (
                    <CheckCircle size={20} className="text-white" />
                  ) : (
                    <XCircle size={20} className="text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-serif font-semibold text-base mb-2 text-gray-900 dark:text-white">
                    {q.question}
                  </p>
                  {!answers[idx].correct && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Correct answer:
                      </span>{" "}
                      {q.options[q.correctAnswer]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRetry}
          className="px-10 py-4 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-serif font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-10 shadow-xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
              <HelpCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                Knowledge Check
              </h3>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
                {lessonTitle}
              </p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          <motion.div
            className="h-full bg-amber-500 dark:bg-amber-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 pb-6 border-b-2 border-slate-200 dark:border-slate-800">
            <span className="block text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 mb-3">
              Question {currentQuestion + 1}
            </span>
            <h4 className="text-2xl font-serif font-bold leading-relaxed text-gray-900 dark:text-white">
              {question.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;

              let className =
                "w-full p-6 rounded-xl border-2 text-left transition-all font-medium text-base ";

              if (!showResult) {
                className += isSelected
                  ? "border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-gray-900 dark:text-white shadow-md"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-gray-900 dark:text-white";
              } else {
                if (isCorrectAnswer) {
                  className +=
                    "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-gray-900 dark:text-white";
                } else if (isSelected && !isCorrectAnswer) {
                  className +=
                    "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30 text-gray-900 dark:text-white";
                } else {
                  className +=
                    "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-40 text-slate-600 dark:text-slate-500";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={className}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrectAnswer && (
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                        <XCircle size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl mb-8 border-l-4 ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-600"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-600"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-600 dark:text-slate-400">
                {isCorrect ? "✓ Correct!" : "Explanation"}
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                {question.explanation}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-serif font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-serif font-bold text-lg transition-all shadow-md"
              >
                {currentQuestion < questions.length - 1
                  ? "Next Question →"
                  : "See Results"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InteractiveQuiz;
