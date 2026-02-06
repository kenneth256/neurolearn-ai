"use client";
import React from "react";
import { Trophy, CheckCircle2 } from "lucide-react";

export interface MilestonesProps {
  milestones: string[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div className="my-16 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 p-8 overflow-hidden relative">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Weekly Milestones
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Key achievements to reach this module
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-amber-200 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-700 transition-colors group"
            >
              <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border-2 border-amber-300 dark:border-amber-700 group-hover:border-amber-500 dark:group-hover:border-amber-500 transition-colors">
                  <CheckCircle2
                    className="text-amber-600 dark:text-amber-400"
                    size={16}
                  />
                </div>
              </div>
              <p className="flex-1 text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {milestone}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Milestones;
