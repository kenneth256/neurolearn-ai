"use client";

import React, { useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import MoodAssessment from "./moodassessment"; 

interface QuickMoodCheckProps {
  enrollmentId?: string;
  lessonModuleId?: string;
  courseModuleId?: string;
  onMoodDetected?: (mood: any) => void;
  variant?: "button" | "floating";
}

export default function QuickMoodCheck({
  enrollmentId,
  lessonModuleId,
  courseModuleId,
  onMoodDetected,
  variant = "button",
}: QuickMoodCheckProps) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [lastMood, setLastMood] = useState<any>(null);

  const handleMoodDetected = (mood: any) => {
    setLastMood(mood);
    onMoodDetected?.(mood);
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      ENGAGED: "😊",
      NEUTRAL: "😐",
      BORED: "😴",
      FRUSTRATED: "😤",
      CONFUSED: "🤔",
      EXCITED: "🤩",
      OVERWHELMED: "😵",
    };
    return emojis[mood] || "😐";
  };

  if (variant === "floating") {
    return (
      <>
        <button
          onClick={() => setShowAssessment(true)}
          className="relative w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 border-2 border-white/20 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group"
          title="How are you feeling?"
        >
          {lastMood ? (
            <span className="text-lg">{getMoodEmoji(lastMood.mood)}</span>
          ) : (
            <>
              <Brain className="w-5 h-5 mx-auto text-white group-hover:hidden" />
              <Sparkles className="w-5 h-5 mx-auto text-white hidden group-hover:block animate-pulse" />
            </>
          )}

          {lastMood && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </button>

        {showAssessment && (
          <MoodAssessment
            enrollmentId={enrollmentId}
            lessonModuleId={lessonModuleId}
            courseModuleId={courseModuleId}
            context="quick"
            onMoodDetected={handleMoodDetected}
            onClose={() => setShowAssessment(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAssessment(true)}
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
      >
        <Brain className="w-4 h-4" />
        Quick Mood Check
      </button>

      {showAssessment && (
        <MoodAssessment
          enrollmentId={enrollmentId}
          lessonModuleId={lessonModuleId}
          courseModuleId={courseModuleId}
          context="quick"
          onMoodDetected={handleMoodDetected}
          onClose={() => setShowAssessment(false)}
        />
      )}
    </>
  );
}
