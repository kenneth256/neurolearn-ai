"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, CheckCircle, ArrowRight } from "lucide-react";
import MoodInterventionPopup from "./MoodInterventionPopup"; // You'll create this

interface MoodAssessmentProps {
  enrollmentId?: string;
  lessonModuleId?: string;
  courseModuleId?: string;
  context?: string;
  onMoodDetected?: (mood: any) => void;
  onClose?: () => void;
}

interface MoodQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    mood: string;
    intensity: number;
  }[];
}

const MOOD_QUESTIONS: MoodQuestion[] = [
  {
    id: "energy",
    question: "How are you feeling about this lesson right now?",
    options: [
      { text: "🤩 Excited and ready to learn!", mood: "EXCITED", intensity: 5 },
      { text: "😊 Interested and focused", mood: "ENGAGED", intensity: 4 },
      {
        text: "😐 Neutral, just following along",
        mood: "NEUTRAL",
        intensity: 3,
      },
      { text: "🤔 A bit confused", mood: "CONFUSED", intensity: 3 },
      { text: "😤 Finding this frustrating", mood: "FRUSTRATED", intensity: 4 },
      { text: "😴 Feeling bored", mood: "BORED", intensity: 3 },
      {
        text: "😵 Overwhelmed by the content",
        mood: "OVERWHELMED",
        intensity: 5,
      },
    ],
  },
  {
    id: "understanding",
    question: "How well do you understand the material so far?",
    options: [
      {
        text: "💯 Crystal clear, I've got this!",
        mood: "ENGAGED",
        intensity: 5,
      },
      { text: "👍 Pretty good, making sense", mood: "ENGAGED", intensity: 4 },
      { text: "🤷 Some parts are unclear", mood: "CONFUSED", intensity: 3 },
      { text: "😵‍💫 Lost and need help", mood: "CONFUSED", intensity: 5 },
    ],
  },
  {
    id: "pace",
    question: "How does the learning pace feel?",
    options: [
      { text: "🐌 Too slow, I'm getting bored", mood: "BORED", intensity: 4 },
      { text: "✅ Just right for me", mood: "ENGAGED", intensity: 4 },
      {
        text: "🏃 Too fast, hard to keep up",
        mood: "OVERWHELMED",
        intensity: 4,
      },
    ],
  },
];

const QUICK_CHECK_QUESTION: MoodQuestion = {
  id: "quick",
  question: "Quick check-in: How are you feeling?",
  options: [
    { text: "😊 Good - I'm learning!", mood: "ENGAGED", intensity: 4 },
    { text: "😐 Okay - keeping up", mood: "NEUTRAL", intensity: 3 },
    { text: "🤔 Confused - need help", mood: "CONFUSED", intensity: 4 },
    { text: "😤 Frustrated - struggling", mood: "FRUSTRATED", intensity: 4 },
    { text: "😴 Bored - too easy", mood: "BORED", intensity: 3 },
  ],
};

export default function MoodAssessment({
  enrollmentId,
  lessonModuleId,
  courseModuleId,
  context = "general",
  onMoodDetected,
  onClose,
}: MoodAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuick, setShowQuick] = useState(context === "quick");
  const [showIntervention, setShowIntervention] = useState<any>(null); // ✨ NEW

  const questions = showQuick ? [QUICK_CHECK_QUESTION] : MOOD_QUESTIONS;
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleAnswer = (option: any) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: option,
    };
    setAnswers(newAnswers);

    if (isLastQuestion || showQuick) {
      submitMood(newAnswers);
    } else {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const submitMood = async (finalAnswers: Record<string, any>) => {
    setIsSubmitting(true);

    try {
      const moodCounts: Record<
        string,
        { count: number; totalIntensity: number }
      > = {};

      Object.values(finalAnswers).forEach((answer: any) => {
        if (!moodCounts[answer.mood]) {
          moodCounts[answer.mood] = { count: 0, totalIntensity: 0 };
        }
        moodCounts[answer.mood].count++;
        moodCounts[answer.mood].totalIntensity += answer.intensity;
      });

      let dominantMood = "NEUTRAL";
      let maxScore = 0;

      Object.entries(moodCounts).forEach(([mood, data]) => {
        const score = data.count * data.totalIntensity;
        if (score > maxScore) {
          maxScore = score;
          dominantMood = mood;
        }
      });

      const avgIntensity = Math.round(
        moodCounts[dominantMood].totalIntensity /
          moodCounts[dominantMood].count,
      );

      const moodResult = {
        mood: dominantMood,
        intensity: avgIntensity,
        confidence: 0.85,
        trigger: getTriggerMessage(finalAnswers),
        context,
        questionAnswers: finalAnswers,
      };

      if (enrollmentId) {
        const response = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId,
            lessonModuleId,
            courseModuleId,
            mood: moodResult.mood,
            intensity: avgIntensity,
            trigger: moodResult.trigger,
            context: `${context} - Question-based assessment`,
            metadata: {
              questionAnswers: finalAnswers,
              assessmentType: showQuick ? "quick" : "comprehensive",
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();

          // ✨ NEW: Check if intervention was generated
          if (result.data?.intervention) {
            console.log("📊 Intervention received:", result.data.intervention);
            // Close mood assessment
            onClose?.();
            // Show intervention popup
            setShowIntervention(result.data.intervention);
            return; // Don't close yet, intervention will handle it
          }
        } else {
          console.error("Failed to save mood entry");
        }
      }

      onMoodDetected?.(moodResult);

      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Failed to submit mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTriggerMessage = (answers: Record<string, any>): string => {
    const triggers: string[] = [];

    if (
      answers.understanding?.intensity >= 4 &&
      answers.understanding?.mood === "CONFUSED"
    ) {
      triggers.push("Struggling to understand core concepts");
    }
    if (answers.pace?.mood === "OVERWHELMED") {
      triggers.push("Content pace feels too fast");
    }
    if (answers.pace?.mood === "BORED") {
      triggers.push("Content pace feels too slow");
    }
    if (answers.energy?.mood === "FRUSTRATED") {
      triggers.push("Experiencing frustration with the material");
    }

    return triggers.length > 0
      ? triggers.join(", ")
      : "General learning state assessment";
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-amber-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {showQuick ? "Quick Mood Check" : "How Are You Feeling?"}
                    </h3>
                    <p className="text-sm text-indigo-100">
                      {showQuick
                        ? "Help me personalize your experience"
                        : `Step ${currentStep + 1} of ${questions.length}`}
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

            {/* Progress Bar */}
            {!showQuick && (
              <div className="h-1 bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Question */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {!isSubmitting ? (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      {currentQuestion.question}
                    </h4>

                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left p-2 bg-gray-50 dark:bg-black/25 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border-2 border-transparent hover:border-indigo-500 transition-all"
                        >
                          <span className="text-base text-gray-800 dark:text-gray-200">
                            {option.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Thanks for sharing!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Analyzing your response...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isSubmitting && !showQuick && (
              <div className="px-6 pb-6 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <button
                  onClick={onClose}
                  className="hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Skip for now
                </button>
                <span>
                  {currentStep + 1} / {questions.length}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showIntervention && (
        <MoodInterventionPopup
          intervention={showIntervention}
          onClose={() => {
            setShowIntervention(null);
            onClose?.();
          }}
          onComplete={async (response) => {
            try {
              await fetch(
                `/api/mood/intervention/${showIntervention.id}/respond`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                },
              );
            } catch (error) {
              console.error("Failed to save intervention response:", error);
            }
            setShowIntervention(null);
            onClose?.();
          }}
        />
      )}
    </>
  );
}
