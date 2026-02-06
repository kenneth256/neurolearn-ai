"use client";
import React, { useState } from "react";
import {
  Terminal,
  Lightbulb,
  CheckCircle2,
  Lock,
  Unlock,
  Code2,
} from "lucide-react";

interface Exercise {
  title: string;
  description: string;
  objective: string;
  starterCode?: string;
  solutionCode: string;
  hints: string[];
}

interface PracticeSectionProps {
  exercises: Exercise[];
}

const PracticeSection: React.FC<PracticeSectionProps> = ({ exercises }) => {
  const [unlockedSolutions, setUnlockedSolutions] = useState<
    Record<number, boolean>
  >({});

  const toggleSolution = (idx: number) => {
    setUnlockedSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
          <Terminal size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Lab Protocol
          </h3>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Applied Engineering Lab
          </p>
        </div>
      </div>

      {exercises.map((ex, idx) => (
        <div
          key={idx}
          className="relative group border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50 transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          {/* Exercise Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-between items-start mb-4">
              <span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                Exercise {idx + 1}
              </span>
            </div>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {ex.title}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-serif italic text-lg">
              "{ex.description}"
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Objective */}
            <div className="flex gap-4">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Target Objective
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {ex.objective}
                </p>
              </div>
            </div>

            {/* Hints Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Lightbulb size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Architect's Hints
                </span>
              </div>
              <ul className="grid gap-2">
                {ex.hints.map((hint, hIdx) => (
                  <li
                    key={hIdx}
                    className="text-sm text-slate-500 dark:text-slate-400 flex gap-2 items-start"
                  >
                    <span className="text-amber-400">•</span> {hint}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution Toggle */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => toggleSolution(idx)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-indigo-500"
              >
                {unlockedSolutions[idx] ? (
                  <Unlock size={14} />
                ) : (
                  <Lock size={14} />
                )}
                {unlockedSolutions[idx]
                  ? "Hide Reference Implementation"
                  : "Reveal Reference Implementation"}
              </button>

              {unlockedSolutions[idx] && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-slate-950 rounded-2xl p-6 font-mono text-sm overflow-x-auto border-2 border-indigo-500/30">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                      <span className="text-indigo-400 flex items-center gap-2 italic">
                        <Code2 size={14} /> solution.tsx
                      </span>
                    </div>
                    <pre className="text-indigo-50/90 leading-relaxed">
                      <code>{ex.solutionCode}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PracticeSection;
