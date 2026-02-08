"use client";
import React from "react";
import { AlertTriangle, Brain, Wrench } from "lucide-react";

export interface Pitfall {
  mistake: string;
  mentalModelFix: string;
  debuggingHack: string;
}

export interface CommonPitfallsProps {
  pitfalls: Pitfall[];
}

const CommonPitfalls: React.FC<CommonPitfallsProps> = ({ pitfalls }) => {
  if (!pitfalls || pitfalls.length === 0) {
    return null;
  }

  return (
    <div className="my-24 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
            Common Pitfalls & Debugging
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-14 uppercase tracking-widest font-mono">
          Learn from common mistakes
        </p>
      </div>

      <div className="space-y-8">
        {pitfalls.map((pitfall, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Mistake Header */}
            <div className="bg-gradient-to-r from-amber-50 to-slate-50 dark:from-gray-800 dark:to-gray-850 border-b-2 border-slate-200 dark:border-slate-800 px-8 py-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className="p-2.5 bg-amber-500 rounded-xl shadow-md">
                    <AlertTriangle className="text-white" size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">
                      Common Mistake
                    </span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-600">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-base font-serif leading-relaxed text-slate-900 dark:text-slate-100">
                    {pitfall.mistake}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-900">
              {/* Mental Model Fix */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700">
                    <Brain
                      className="text-slate-700 dark:text-slate-400"
                      size={20}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Mental Model Fix
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-slate-400 dark:border-slate-600 p-4 rounded-r-lg">
                    <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                      {pitfall.mentalModelFix}
                    </p>
                  </div>
                </div>
              </div>

              {/* Debugging Hack */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                    <Wrench
                      className="text-amber-600 dark:text-amber-500"
                      size={20}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    Debugging Hack
                  </h5>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 dark:border-amber-600 p-4 rounded-r-lg">
                    <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                      {pitfall.debuggingHack}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-6 rounded-r-xl">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-600 dark:text-amber-500 text-sm">
              💡
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-serif font-semibold">Pro tip:</span> Bookmark
            this section for quick reference. These pitfalls represent the most
            common stumbling blocks learners encounter in this module.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommonPitfalls;
