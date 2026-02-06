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
    <div className="my-16 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="text-rose-500" size={24} />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Common Pitfalls & Debugging
        </h3>
      </div>

      <div className="space-y-6">
        {pitfalls.map((pitfall, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 overflow-hidden"
          >
            {/* Mistake */}
            <div className="bg-rose-100 dark:bg-rose-900/30 border-b-2 border-rose-200 dark:border-rose-900/50 px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <AlertTriangle className="text-white" size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400 mb-2">
                    Common Mistake
                  </h4>
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                    {pitfall.mistake}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Mental Model Fix */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Brain
                      className="text-indigo-600 dark:text-indigo-400"
                      size={18}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                    Mental Model Fix
                  </h5>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {pitfall.mentalModelFix}
                  </p>
                </div>
              </div>

              {/* Debugging Hack */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Wrench
                      className="text-emerald-600 dark:text-emerald-400"
                      size={18}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                    Debugging Hack
                  </h5>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {pitfall.debuggingHack}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommonPitfalls;
