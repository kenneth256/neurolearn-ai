// components/ProgressTracker.tsx
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Award, TrendingUp } from "lucide-react";

interface ProgressData {
  completedLessons: Set<string>;
  completedModules: Set<number>;
  totalTimeSpent: number; // in minutes
  lastStudyDate: string;
  streak: number;
}

interface ProgressTrackerProps {
  totalModules: number;
  totalLessons: number;
  onProgressUpdate?: (progress: ProgressData) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalModules,
  totalLessons,
  onProgressUpdate,
}) => {
  const [progress, setProgress] = useState<ProgressData>(() => {
   
    const saved = localStorage.getItem("learning_progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        completedLessons: new Set(parsed.completedLessons),
        completedModules: new Set(parsed.completedModules),
      };
    }
    return {
      completedLessons: new Set<string>(),
      completedModules: new Set<number>(),
      totalTimeSpent: 0,
      lastStudyDate: new Date().toISOString(),
      streak: 0,
    };
  });

  // Save progress to localStorage
  useEffect(() => {
    const toSave = {
      ...progress,
      completedLessons: Array.from(progress.completedLessons),
      completedModules: Array.from(progress.completedModules),
    };
    localStorage.setItem("learning_progress", JSON.stringify(toSave));
    onProgressUpdate?.(progress);
  }, [progress, onProgressUpdate]);

  // Calculate completion percentage
  const lessonProgress = (progress.completedLessons.size / totalLessons) * 100;
  const moduleProgress = (progress.completedModules.size / totalModules) * 100;

  // Track study time
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => ({
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + 1,
      }));
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-serif">Your Progress</h3>
        <div className="flex items-center gap-2 text-amber-600">
          <TrendingUp size={20} />
          <span className="font-mono text-sm">
            {Math.round(lessonProgress)}%
          </span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Lessons Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Lessons Completed</span>
            <span className="font-mono font-bold">
              {progress.completedLessons.size}/{totalLessons}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-400 to-amber-600 transition-all duration-500"
              style={{ width: `${lessonProgress}%` }}
            />
          </div>
        </div>

        {/* Modules Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Modules Completed</span>
            <span className="font-mono font-bold">
              {progress.completedModules.size}/{totalModules}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-500"
              style={{ width: `${moduleProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Study Time</div>
            <div className="font-bold font-mono">
              {formatTime(progress.totalTimeSpent)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Award size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Streak</div>
            <div className="font-bold font-mono">{progress.streak} days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;

// Hook to use in lessons
export const useLessonProgress = (lessonId: string, moduleId: number) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("learning_progress");
    if (saved) {
      const progress = JSON.parse(saved);
      setIsComplete(progress.completedLessons?.includes(lessonId));
    }
  }, [lessonId]);

  const toggleComplete = () => {
    const saved = localStorage.getItem("learning_progress");
    const progress = saved
      ? JSON.parse(saved)
      : {
          completedLessons: [],
          completedModules: [],
          totalTimeSpent: 0,
          lastStudyDate: new Date().toISOString(),
          streak: 0,
        };

    const completedLessons = new Set(progress.completedLessons);

    if (completedLessons.has(lessonId)) {
      completedLessons.delete(lessonId);
    } else {
      completedLessons.add(lessonId);
    }

    localStorage.setItem(
      "learning_progress",
      JSON.stringify({
        ...progress,
        completedLessons: Array.from(completedLessons),
      }),
    );

    setIsComplete(!isComplete);
  };

  return { isComplete, toggleComplete };
};
