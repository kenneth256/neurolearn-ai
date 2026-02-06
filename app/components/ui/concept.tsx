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
      {/* 1. Header & Indexing */}
      <div className="flex items-start gap-5 mb-8">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-100 text-amber-400 dark:text-amber-600 flex items-center justify-center font-mono text-sm font-black shadow-lg shadow-slate-200 dark:shadow-slate-900/50">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {title}
          </h3>
          <div className="h-1 w-20 bg-amber-400 dark:bg-amber-500 rounded-full" />
        </div>
      </div>
      
      <div className="mb-10">
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-slate-900 dark:first-letter:text-slate-100 first-letter:mr-3 first-letter:float-left">
          {narrative}
        </p>
      </div>
     
      <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-4xl p-8 border border-amber-100/50 dark:border-amber-900/30 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-400 dark:bg-amber-500 opacity-50" />
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-black text-[11px] uppercase tracking-[0.2em] mb-4">
          <Lightbulb
            size={18}
            className="fill-amber-200 dark:fill-amber-900 animate-pulse"
          />
          The Conceptual Bridge
        </div>
        <p className="text-slate-800 dark:text-slate-200 text-lg italic font-medium leading-relaxed font-serif">
          "{analogy}"
        </p>
      </div>
      {/* 4. Code / Technical Logic Walkthrough */}
      {codeData && (
        <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
          <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
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
            <pre className="p-8 bg-slate-950 dark:bg-black text-amber-100 dark:text-amber-200 font-mono text-sm overflow-x-auto leading-relaxed">
              <code>{codeData.code}</code>
            </pre>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-4">
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
      {/* 5. The "Gotcha" (Edge Cases) */}
      <div className="bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-6 flex gap-5 mb-10 transition-colors hover:bg-rose-50/50 dark:hover:bg-rose-950/30">
        <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-xl shrink-0 h-fit">
          <AlertCircle className="text-rose-600 dark:text-rose-400" size={24} />
        </div>
        <div>
          <span className="block text-xs font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-2">
            Critical Limitation / Edge Case
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {edgeCase}
          </p>
        </div>
      </div>
      {/* 6. Interaction Layer (Exercises & Socratic Inquiry) */}
      {(exercises.length > 0 || inquiry) && (
        <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-10">
          {/* Render Exercises */}
          {exercises.length > 0 &&
            exercises.map((exercise, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-6">
                {/* Challenge / Inquiry */}
                <div className="group p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-slate-950/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-500 dark:text-indigo-400">
                      <HelpCircle size={18} />
                    </div>
                    <span className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">
                      Exercise {idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {exercise.title}
                  </h3>

                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif text-lg mb-4">
                    {exercise.challenge}
                  </p>

                  {exercise.constraints && exercise.constraints.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-bold">
                        Constraints
                      </p>
                      <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400 list-disc list-inside">
                        {exercise.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Protocol / Solution / Hints */}
                <div className="group p-6 bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-900 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg text-amber-500 dark:text-amber-400">
                      <Zap size={18} />
                    </div>
                    <span className="font-black text-amber-500 dark:text-amber-400 uppercase text-[10px] tracking-widest">
                      Hands-on Protocol
                    </span>
                  </div>

                  {exercise.hints && exercise.hints.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">
                        Hints
                      </p>
                      <ul className="space-y-2 text-sm text-slate-300 dark:text-slate-400 list-disc list-inside">
                        {exercise.hints.map((hint, i) => (
                          <li key={i}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Learning Path Component */}
                  {exercise.learningPath &&
                    (exercise.learningPath.forBeginners ||
                      exercise.learningPath.forAdvanced) && (
                      <div className="mb-4 border border-slate-700 dark:border-slate-600 rounded-xl overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-700 dark:border-slate-600">
                          {exercise.learningPath.forBeginners && (
                            <button
                              onClick={() => togglePath(idx, "beginner")}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${
                                (activePath[idx] || "beginner") === "beginner"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-800 dark:bg-slate-900 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <GraduationCap size={14} />
                              <span>BEGINNER</span>
                            </button>
                          )}
                          {exercise.learningPath.forAdvanced && (
                            <button
                              onClick={() => togglePath(idx, "advanced")}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${
                                activePath[idx] === "advanced"
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-800 dark:bg-slate-900 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <Rocket size={14} />
                              <span>ADVANCED</span>
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 bg-slate-800/50 dark:bg-slate-950/50">
                          {(activePath[idx] || "beginner") === "beginner" &&
                            exercise.learningPath.forBeginners && (
                              <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed">
                                {exercise.learningPath.forBeginners}
                              </p>
                            )}
                          {activePath[idx] === "advanced" &&
                            exercise.learningPath.forAdvanced && (
                              <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed">
                                {exercise.learningPath.forAdvanced}
                              </p>
                            )}
                        </div>
                      </div>
                    )}

                  {exercise.fullSolution && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2 font-bold">
                        Solution
                      </p>
                      <pre className="font-mono text-[13px] text-slate-300 dark:text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-950/40 rounded-lg p-4">
                        {exercise.fullSolution}
                      </pre>
                    </div>
                  )}

                  {exercise.explanationOfSolution && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed">
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
