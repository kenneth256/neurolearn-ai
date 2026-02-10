"use client";
import React, { useState } from "react";
import {
  Lightbulb,
  AlertCircle,
  Terminal,
  Copy,
  Check,
  Info,
  HelpCircle,
  Zap,
  GraduationCap,
  Rocket,
  Sparkles,
} from "lucide-react";

export type Exercise = {
  title: string;
  challenge: string;
  constraints?: string[];
  starterCode?: string | null;
  hints?: string[];
  fullSolution?: string;
  explanationOfSolution?: string;
  learningPath?: {
    forBeginners?: string;
    forAdvanced?: string;
  };
};

export type Props = {
  exercises?: Exercise[];
};

export interface Concept {
  title?: string;
  narrativeExplanation?: string;
  interactiveAnalogy?: string;
  edgeCase?: string;
  handsOnPractice?: {
    exercises: string;
  };

  conceptTitle?: string;
  deepDive?: string;
  realWorldApplication?: string;
  commonMisconceptions?: string[];
  socraticInquiry?: string;

  codeWalkthrough?: {
    code: string;
    analysis: string;
    language: string;
  };
}

export interface ConceptSectionProps {
  concept: Concept;
  index: number;
  exercises?: Exercise[];
  preLesson?: [] | null;
}

const ConceptSection: React.FC<ConceptSectionProps> = ({
  concept,
  index,
  exercises = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [activePath, setActivePath] = useState<{
    [key: number]: "beginner" | "advanced";
  }>({});

  const title =
    concept.title ??
    concept.conceptTitle ??
    (concept as any).concept ??
    "Untitled Concept";

  const narrative =
    concept.narrativeExplanation ??
    concept.deepDive ??
    (concept as any).description ??
    "No detailed explanation provided.";

  const analogy =
    (concept as any).whyScenario ??
    concept.realWorldApplication ??
    concept.interactiveAnalogy ??
    "This concept applies in various real-world scenarios.";

  const edgeCase =
    (concept as any).gotcha ??
    concept.commonMisconceptions?.join(" ") ??
    concept.edgeCase ??
    "Observe context to avoid common pitfalls.";

  const codeData = concept.codeWalkthrough;
  const inquiry = concept.socraticInquiry ?? (concept as any).socraticInquiry;

  const handleCopy = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const togglePath = (idx: number, path: "beginner" | "advanced") => {
    setActivePath((prev) => ({
      ...prev,
      [idx]: path,
    }));
  };

  return (
    <div className="mb-24 last:mb-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-start gap-5 mb-8">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#0f172a] dark:bg-slate-100 text-[#f59e0b] dark:text-[#d97706] flex items-center justify-center font-mono text-sm font-black shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] leading-tight">
            {title}
          </h3>
          <div className="h-1 w-20 bg-[#f59e0b] dark:bg-[#fbbf24] rounded-full" />
        </div>
      </div>

      <div className="mb-10">
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-[#0f172a] dark:first-letter:text-[#f8fafc] first-letter:mr-3 first-letter:float-left">
          {narrative}
        </p>
      </div>

      <div className="bg-[#fffbeb]/60 dark:bg-amber-950/20 rounded-4xl p-8 border border-amber-200/50 dark:border-amber-900/30 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#f59e0b] dark:bg-[#fbbf24] opacity-50" />
        <div className="flex items-center gap-3 text-[#d97706] dark:text-[#fbbf24] font-black text-[11px] uppercase tracking-[0.2em] mb-4">
          <Lightbulb
            size={18}
            className="fill-amber-200 dark:fill-amber-900 animate-pulse"
          />
          The Conceptual Bridge
        </div>
        <p className="text-[#0f172a] dark:text-slate-200 text-lg italic font-medium leading-relaxed font-serif">
          "{analogy}"
        </p>
      </div>

      {codeData && (
        <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
          <div className="bg-[#0f172a] dark:bg-black px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4 border-l border-slate-700 dark:border-slate-600 pl-4">
                {codeData.language || "System.logic"}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
            >
              {copied ? (
                <Check size={18} className="text-emerald-400" />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>
          <div className="p-0">
            <pre className="p-8 bg-[#020617] dark:bg-black text-amber-100 dark:text-amber-200 font-mono text-sm overflow-x-auto leading-relaxed">
              <code>{codeData.code}</code>
            </pre>
            <div className="bg-slate-50 dark:bg-[#0f172a] p-6 border-t border-slate-200 dark:border-slate-700 flex gap-4">
              <Info
                size={20}
                className="text-slate-400 dark:text-slate-500 shrink-0"
              />
              <div>
                <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                  Logical Decomposition
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {codeData.analysis}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#fffbeb]/60 via-white to-red-50/20 dark:from-amber-950/10 dark:via-[#0f172a] dark:to-red-950/10 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-7 flex gap-5 mb-10 transition-all hover:shadow-lg shadow-amber-100 dark:shadow-amber-950/20">
        <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] p-3 rounded-xl shrink-0 shadow-md flex items-center justify-center">
          <AlertCircle className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <span className="block text-xs font-black text-[#d97706] dark:text-[#fbbf24] uppercase tracking-[0.2em] mb-3">
            Critical Limitation / Edge Case
          </span>
          <p className="text-[#0f172a] dark:text-slate-200 leading-relaxed font-medium text-base">
            {edgeCase}
          </p>
        </div>
      </div>

      {(exercises.length > 0 || inquiry) && (
        <div className="mt-16 pt-12 border-t-2 border-slate-200 dark:border-slate-800 space-y-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] dark:bg-[#fbbf24] flex items-center justify-center shadow-md">
              <Sparkles className="text-white dark:text-black" size={20} />
            </div>
            <h4 className="text-2xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc]">
              Hands-On Practice
            </h4>
          </div>

          {exercises.length > 0 &&
            exercises.map((exercise, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-6">
                <div className="group p-8 bg-white dark:bg-[#0f172a] rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                      <HelpCircle
                        size={20}
                        className="text-slate-600 dark:text-slate-400"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.2em]">
                        Exercise {idx + 1}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#fffbeb] dark:bg-amber-950/30 flex items-center justify-center">
                      <span className="text-[#f59e0b] dark:text-[#fbbf24] font-mono font-bold text-sm">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] mb-4">
                    {exercise.title}
                  </h3>

                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif text-base mb-6">
                    {exercise.challenge}
                  </p>

                  {exercise.constraints && exercise.constraints.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3 font-black flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        Constraints
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-none">
                        {exercise.constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#f59e0b] dark:text-[#fbbf24] mt-1">
                              •
                            </span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="group p-8 bg-[#0f172a] dark:bg-black rounded-2xl shadow-2xl border-2 border-slate-700 dark:border-slate-800 hover:border-[#f59e0b]/50 dark:hover:border-[#fbbf24]/50 transition-all">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-700 dark:border-slate-800">
                    <div className="w-10 h-10 bg-[#f59e0b]/20 dark:bg-[#fbbf24]/20 rounded-xl flex items-center justify-center">
                      <Zap
                        size={20}
                        className="text-[#f59e0b] dark:text-[#fbbf24]"
                      />
                    </div>
                    <span className="font-black text-[#f59e0b] dark:text-[#fbbf24] uppercase text-xs tracking-[0.2em]">
                      Solution Protocol
                    </span>
                  </div>

                  {exercise.hints && exercise.hints.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3 font-black flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        Hints
                      </p>
                      <ul className="space-y-2 text-sm text-slate-300 list-none">
                        {exercise.hints.map((hint, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#f59e0b] dark:text-[#fbbf24] mt-1">
                              →
                            </span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exercise.learningPath &&
                    (exercise.learningPath.forBeginners ||
                      exercise.learningPath.forAdvanced) && (
                      <div className="mb-6 border-2 border-slate-700 dark:border-slate-600 rounded-xl overflow-hidden">
                        <div className="flex border-b-2 border-slate-700 dark:border-slate-600">
                          {exercise.learningPath.forBeginners && (
                            <button
                              onClick={() => togglePath(idx, "beginner")}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all ${
                                (activePath[idx] || "beginner") === "beginner"
                                  ? "bg-[#f59e0b] dark:bg-[#fbbf24] text-white dark:text-black shadow-lg"
                                  : "bg-slate-700 dark:bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                              }`}
                            >
                              <GraduationCap size={16} />
                              <span>Beginner</span>
                            </button>
                          )}
                          {exercise.learningPath.forAdvanced && (
                            <button
                              onClick={() => togglePath(idx, "advanced")}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all ${
                                activePath[idx] === "advanced"
                                  ? "bg-slate-600 text-white shadow-lg"
                                  : "bg-slate-700 dark:bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                              }`}
                            >
                              <Rocket size={16} />
                              <span>Advanced</span>
                            </button>
                          )}
                        </div>

                        <div className="p-5 bg-slate-900/50 dark:bg-black/50">
                          {(activePath[idx] || "beginner") === "beginner" &&
                            exercise.learningPath.forBeginners && (
                              <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed font-medium">
                                {exercise.learningPath.forBeginners}
                              </p>
                            )}
                          {activePath[idx] === "advanced" &&
                            exercise.learningPath.forAdvanced && (
                              <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed font-medium">
                                {exercise.learningPath.forAdvanced}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                  {exercise.fullSolution && (
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-green-400 mb-3 font-black flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-green-400" />
                        Solution
                      </p>
                      <pre className="font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-black/40 rounded-xl p-5 border border-slate-700">
                        {exercise.fullSolution}
                      </pre>
                    </div>
                  )}

                  {exercise.explanationOfSolution && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 font-black flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        Explanation
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        {exercise.explanationOfSolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ConceptSection;
