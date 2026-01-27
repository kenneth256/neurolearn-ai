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
} from "lucide-react";

export interface Concept {
  // Refined / UI-ready
  title?: string;
  narrativeExplanation?: string;
  interactiveAnalogy?: string;
  edgeCase?: string;

  // Raw dataset support
  conceptTitle?: string;
  deepDive?: string;
  realWorldApplication?: string;
  commonMisconceptions?: string[];

  // Code support
  codeWalkthrough?: {
    code: string;
    analysis: string;
    language: string;
  };
}

export interface ConceptSectionProps {
  concept: Concept;
  index: number;
}

const ConceptSection: React.FC<ConceptSectionProps> = ({ concept, index }) => {
  const [copied, setCopied] = useState(false);

  // 🔒 GREEDY NORMALIZATION LOGIC
  // We check every possible key variation to ensure 0% data loss.

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
    concept.commonMisconceptions?.[0] ??
    concept.edgeCase ??
    "Observe context to avoid common pitfalls.";

  const codeData = concept.codeWalkthrough;
  const inquiry = (concept as any).socraticInquiry;
  const task = (concept as any).handsOnTask;

  const handleCopy = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-24 last:mb-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* 1. Header & Indexing */}
      <div className="flex items-start gap-5 mb-8">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-mono text-sm font-black shadow-lg shadow-slate-200">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 leading-tight">
            {title}
          </h3>
          <div className="h-1 w-20 bg-amber-400 rounded-full" />
        </div>
      </div>

      {/* 2. The Deep Dive (Narrative) */}
      <div className="mb-10">
        <p className="text-xl text-slate-600 leading-relaxed font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left">
          {narrative}
        </p>
      </div>

      {/* 3. Real-World Bridge (Analogy) */}
      <div className="bg-amber-50/40 rounded-4xl p-8 border border-amber-100/50 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-400 opacity-50" />
        <div className="flex items-center gap-3 text-amber-700 font-black text-[11px] uppercase tracking-[0.2em] mb-4">
          <Lightbulb size={18} className="fill-amber-200 animate-pulse" />
          The Conceptual Bridge
        </div>
        <p className="text-slate-800 text-lg italic font-medium leading-relaxed font-serif">
          "{analogy}"
        </p>
      </div>

      {/* 4. Code / Technical Logic Walkthrough */}
      {codeData && (
        <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-4 border-l border-slate-700 pl-4">
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
            <pre className="p-8 bg-slate-950 text-amber-100 font-mono text-sm overflow-x-auto leading-relaxed">
              <code>{codeData.code}</code>
            </pre>
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex gap-4">
              <Info size={20} className="text-slate-400 shrink-0" />
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Logical Decomposition
                </span>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {codeData.analysis}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. The "Gotcha" (Edge Cases) */}
      <div className="bg-rose-50/30 border border-rose-100/50 rounded-2xl p-6 flex gap-5 mb-10 transition-colors hover:bg-rose-50/50">
        <div className="bg-rose-100 p-3 rounded-xl shrink-0 h-fit">
          <AlertCircle className="text-rose-600" size={24} />
        </div>
        <div>
          <span className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-2">
            Critical Limitation / Edge Case
          </span>
          <p className="text-slate-700 leading-relaxed font-medium">
            {edgeCase}
          </p>
        </div>
      </div>

      {/* 6. Interaction Layer (Socratic & Hands-on) */}
      {(inquiry || task) && (
        <div className="grid md:grid-cols-2 gap-6 mt-12 pt-10 border-t border-slate-100">
          {inquiry && (
            <div className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                  <HelpCircle size={18} />
                </div>
                <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">
                  Socratic Inquiry
                </span>
              </div>
              <p className="text-slate-700 italic leading-relaxed font-serif text-lg">
                {inquiry}
              </p>
            </div>
          )}
          {task && (
            <div className="group p-6 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Zap size={18} />
                </div>
                <span className="font-black text-amber-500 uppercase text-[10px] tracking-widest">
                  Hands-on Protocol
                </span>
              </div>
              <p className="font-mono text-[13px] text-slate-300 leading-relaxed">
                {task}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConceptSection;
