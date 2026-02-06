"use client";
import React, { useState } from "react";
import { GraduationCap, Rocket } from "lucide-react";

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
    <div className="my-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {data.forBeginners && (
          <button
            onClick={() => setActiveTab("beginner")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "beginner"
                ? "bg-emerald-500 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap size={18} />
            <span>BEGINNER</span>
          </button>
        )}
        {data.forAdvanced && (
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "advanced"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Rocket size={18} />
            <span>ADVANCED</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "beginner" && data.forBeginners && (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.forBeginners}
          </p>
        )}
        {activeTab === "advanced" && data.forAdvanced && (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.forAdvanced}
          </p>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
