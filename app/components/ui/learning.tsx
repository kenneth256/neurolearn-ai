"use client";
import React, { useState } from "react";
import { GraduationCap, Rocket, Sparkles } from "lucide-react";

export interface LearningPathData {
  forBeginners?: string;
  forAdvanced?: string;
}

export interface LearningPathProps {
  data: LearningPathData;
}

const LearningPath: React.FC<LearningPathProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<"beginner" | "advanced">(
    "beginner",
  );

  if (!data.forBeginners && !data.forAdvanced) {
    return null;
  }

  return (
    <div className="my-16 bg-gradient-to-br from-white via-amber-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-slate-50 dark:from-gray-800 dark:to-gray-850 border-b-2 border-slate-200 dark:border-slate-800 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Differentiated Learning Paths
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
              Choose your level
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-900">
        {data.forBeginners && (
          <button
            onClick={() => setActiveTab("beginner")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-serif font-bold uppercase tracking-wider transition-all duration-300 relative ${
              activeTab === "beginner"
                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg"
                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap
              size={20}
              className={activeTab === "beginner" ? "" : "opacity-60"}
            />
            <span>Beginner</span>
            {activeTab === "beginner" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
            )}
          </button>
        )}
        {data.forAdvanced && (
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-serif font-bold uppercase tracking-wider transition-all duration-300 relative ${
              activeTab === "advanced"
                ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg"
                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Rocket
              size={20}
              className={activeTab === "advanced" ? "" : "opacity-60"}
            />
            <span>Advanced</span>
            {activeTab === "advanced" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-600" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === "beginner" && data.forBeginners && (
          <div className="space-y-4">
            {/* Beginner badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 px-4 py-2 rounded-xl">
              <GraduationCap
                className="text-amber-600 dark:text-amber-500"
                size={16}
              />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">
                Foundation Level
              </span>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800/50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
              <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {data.forBeginners}
              </p>
            </div>

            {/* Footer tip */}
            <div className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 dark:text-amber-500 text-sm">
                  📚
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold">Starting fresh?</span> This path
                is designed to build your foundational understanding step by
                step.
              </p>
            </div>
          </div>
        )}

        {activeTab === "advanced" && data.forAdvanced && (
          <div className="space-y-4">
            {/* Advanced badge */}
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl">
              <Rocket
                className="text-slate-700 dark:text-slate-400"
                size={16}
              />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
                Mastery Level
              </span>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800/50 border-l-4 border-slate-600 p-6 rounded-r-xl shadow-sm">
              <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {data.forAdvanced}
              </p>
            </div>

            {/* Footer tip */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-6 h-6 rounded-lg bg-slate-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-slate-600 dark:text-slate-400 text-sm"></span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold">Already experienced?</span> This
                path challenges you with advanced concepts and practical
                applications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
