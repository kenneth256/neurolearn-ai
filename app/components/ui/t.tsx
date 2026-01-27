// components/InteractiveQuiz.tsx
"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, RotateCcw, Award } from "lucide-react";
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
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-3xl p-10 text-center"
      >
        <div className="flex justify-center mb-6">
          {passed ? (
            <Award size={80} className="text-amber-500 dark:text-amber-400" />
          ) : (
            <RotateCcw
              size={80}
              className="text-slate-400 dark:text-slate-500"
            />
          )}
        </div>

        <h3 className="text-3xl font-serif font-bold mb-2 text-slate-900 dark:text-slate-100">
          {passed ? "Excellent Work!" : "Keep Practicing!"}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          You scored{" "}
          <span className="font-bold text-2xl text-amber-600 dark:text-amber-400">
            {score}/{questions.length}
          </span>{" "}
          ({Math.round(percentage)}%)
        </p>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                answers[idx].correct
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {answers[idx].correct ? (
                  <CheckCircle
                    size={20}
                    className="text-green-600 dark:text-green-400 mt-1"
                  />
                ) : (
                  <XCircle
                    size={20}
                    className="text-red-600 dark:text-red-400 mt-1"
                  />
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm mb-1 text-slate-900 dark:text-slate-100">
                    {q.question}
                  </p>
                  {!answers[idx].correct && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Correct: {q.options[q.correctAnswer]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRetry}
          className="mt-8 px-8 py-4 bg-amber-500 dark:bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-600 dark:hover:bg-amber-700 transition-all"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
            Quiz: {lessonTitle}
          </h3>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
          <h4 className="text-2xl font-serif font-bold mb-8 leading-relaxed text-slate-900 dark:text-slate-100">
            {question.question}
          </h4>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;

              let className =
                "w-full p-5 rounded-2xl border-2 text-left transition-all font-medium ";

              if (!showResult) {
                className += isSelected
                  ? "border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-900 dark:text-slate-100";
              } else {
                if (isCorrectAnswer) {
                  className +=
                    "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-slate-900 dark:text-slate-100";
                } else if (isSelected && !isCorrectAnswer) {
                  className +=
                    "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30 text-slate-900 dark:text-slate-100";
                } else {
                  className +=
                    "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50 text-slate-900 dark:text-slate-400";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={className}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && isCorrectAnswer && (
                      <CheckCircle
                        size={24}
                        className="text-green-600 dark:text-green-400"
                      />
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <XCircle
                        size={24}
                        className="text-red-600 dark:text-red-400"
                      />
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
              className={`p-6 rounded-2xl mb-6 ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800"
                  : "bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800"
              }`}
            >
              <p className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
                {isCorrect ? "✓ Correct!" : "Explanation:"}
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
                className="flex-1 py-4 bg-amber-500 dark:bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-600 dark:hover:bg-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
              >
                {currentQuestion < questions.length - 1
                  ? "Next Question"
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
