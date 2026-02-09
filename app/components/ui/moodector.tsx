"use client";

import React, { useState, useEffect } from "react";
import { useMoodDetection } from "@/app/hooks/moodDetection"; 
import { Camera, Loader2, AlertCircle, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MoodDetectorProps {
  enrollmentId?: string;
  lessonModuleId?: string;
  courseModuleId?: string;
  onMoodDetected?: (mood: any) => void;
}

export default function MoodDetector({
  enrollmentId,
  lessonModuleId,
  courseModuleId,
  onMoodDetected,
}: MoodDetectorProps) {
  const { videoRef, isDetecting, currentMood, detectMood, cancelDetection } =
    useMoodDetection();

  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDetect = async () => {
    setError(null);
    setShowCamera(true);

    try {
      const mood = await detectMood();

      // Save to database
      if (enrollmentId) {
        setIsSaving(true);
        const response = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId,
            lessonModuleId,
            courseModuleId,
            mood: mood.mood,
            intensity: Math.round(mood.intensity / 20), // Convert back to 1-5
            trigger: mood.trigger,
            context: `Detected during lesson viewing`,
            metadata: {
              confidence: mood.confidence,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save mood entry");
        }

        const result = await response.json();
        console.log("✅ Mood saved:", result);
      }

      // Notify parent component
      onMoodDetected?.(mood);

      setShowCamera(false);
    } catch (err) {
      console.error("Mood detection failed:", err);
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      ENGAGED: "bg-green-500",
      NEUTRAL: "bg-gray-500",
      BORED: "bg-yellow-500",
      FRUSTRATED: "bg-red-500",
      CONFUSED: "bg-orange-500",
      EXCITED: "bg-purple-500",
      OVERWHELMED: "bg-pink-500",
    };
    return colors[mood] || "bg-gray-500";
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

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleDetect}
        disabled={isDetecting || isSaving}
        className="relative w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 border-2 border-white/20 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
        title="Check your mood"
      >
        {isDetecting || isSaving ? (
          <Loader2 className="w-5 h-5 mx-auto text-white animate-spin" />
        ) : currentMood ? (
          <span className="text-lg">{getMoodEmoji(currentMood.mood)}</span>
        ) : (
          <Camera className="w-5 h-5 mx-auto text-white" />
        )}

        {currentMood && !isDetecting && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Camera Preview Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={() => {
              cancelDetection();
              setShowCamera(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Detecting Your Mood
                </h3>
                <button
                  onClick={() => {
                    cancelDetection();
                    setShowCamera(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Preview */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                />

                {isDetecting && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm">Analyzing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {currentMood && (
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Mood detected: {getMoodEmoji(currentMood.mood)}{" "}
                      {currentMood.mood}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {currentMood.trigger}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
