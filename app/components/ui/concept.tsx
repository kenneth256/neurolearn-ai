"use client";
import React from "react";
import { Lightbulb, AlertCircle, Terminal, Copy } from "lucide-react";

// Types for the concept data structure
export interface Concept {
  title: string;
  narrativeExplanation: string;
  interactiveAnalogy: string;
  codeWalkthrough?: {
    code: string;
    analysis: string;
    language: string;
  };
  edgeCase: string;
}

export interface ConceptSectionProps {
  concept: Concept;
  index: number;
}

const ConceptSection: React.FC<ConceptSectionProps> = ({ concept, index }) => {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a 'Copied!' toast notification here
  };

  return (
    <div className="mb-16 last:mb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header with Numbered Badge */}
      <div className="flex items-center gap-4 mb-6">
        <span className="flex-none w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-lg border-2 border-amber-400/20 shadow-sm">
          {index + 1}
        </span>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          {concept.title}
        </h3>
      </div>

      {/* 2. Main Narrative Content */}
      <div className="prose prose-slate max-w-none mb-8">
        <p className="text-lg text-slate-700 leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left">
          {concept.narrativeExplanation}
        </p>
      </div>

      {/* 3. The Analogy (Callout Box) */}
      <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <div className="flex gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-3">
          <Lightbulb size={16} className="fill-amber-100" />
          Conceptual Bridge
        </div>
        <p className="text-slate-800 italic leading-quoted font-medium">
          "{concept.interactiveAnalogy}"
        </p>
      </div>

      {/* 4. Code Walkthrough Section */}
      {concept.codeWalkthrough && (
        <div className="my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <div className="bg-slate-800 px-5 py-3 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-400" />
              <span className="text-xs font-mono text-slate-300 uppercase tracking-tighter">
                {concept.codeWalkthrough.language}
              </span>
            </div>
            <button
              onClick={() =>
                handleCopyCode(concept.codeWalkthrough?.code || "")
              }
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy code"
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="relative">
            <pre className="p-6 bg-[#0d0d0d] text-slate-100 overflow-x-auto text-sm font-mono leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
              <code>{concept.codeWalkthrough.code}</code>
            </pre>
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">
              Technical Analysis
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {concept.codeWalkthrough.analysis}
            </p>
          </div>
        </div>
      )}

      {/* 5. Edge Case (Bottom Warning) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-start transition-colors hover:border-amber-200">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
          <AlertCircle className="text-amber-600 shrink-0" size={20} />
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Important Edge Case
          </span>
          <p className="text-sm text-slate-600 leading-snug">
            {concept.edgeCase}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConceptSection;
