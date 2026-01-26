"use client";
import React from "react";
import { Target, CheckCircle, Award, AlertCircle } from "lucide-react";

export interface ProjectData {
  projectTitle: string;
  description: string;
  requirements: string[];
  assessmentRubric: {
    criterion: string;
    excellent: string;
    satisfactory: string;
    needsWork: string;
  }[];
}

interface CapstoneProjectProps {
  data: ProjectData;
}

const levelConfigs = {
  excellent: {
    label: "Excellent",
    color: "emerald",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50/50",
  },
  satisfactory: {
    label: "Satisfactory",
    color: "amber",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50/50",
  },
  needsWork: {
    label: "Needs Work",
    color: "red",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50/50",
  },
};

const CapstoneProject: React.FC<CapstoneProjectProps> = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl">
      {/* --- HEADER --- */}
      <header className="mb-12 pb-8 border-b-2 border-slate-100">
        <div className="flex items-center gap-2 text-amber-600 mb-4">
          <Target size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Capstone Protocol
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
          {data.projectTitle}
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-3xl">
          {data.description}
        </p>
      </header>

      {/* --- REQUIREMENTS --- */}
      <section className="mb-16">
        <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-8">
          <CheckCircle className="text-emerald-500" size={24} />
          Project Requirements
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {data.requirements.map((req, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">{req}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- ASSESSMENT RUBRIC --- */}
      <section>
        <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-8">
          <Award className="text-amber-500" size={24} />
          Success Criteria
        </h2>
        <div className="space-y-8">
          {data.assessmentRubric.map((rubric, idx) => (
            <div
              key={idx}
              className="bg-white rounded- border border-slate-200 overflow-hidden shadow-sm"
            >
              <div className="bg-slate-900 text-white px-8 py-4">
                <h3 className="font-bold tracking-wide">{rubric.criterion}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {(["excellent", "satisfactory", "needsWork"] as const).map(
                  (key) => {
                    const config = levelConfigs[key];
                    return (
                      <div key={key} className={`p-6 ${config.bg}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className={`w-2 h-2 rounded-full ${config.dot}`}
                          />
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          {rubric[key]}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SUBMISSION FOOTER --- */}
      <footer className="mt-16 p-8 bg-slate-900 rounded-4xl text-white overflow-hidden relative">
        <Sparkles className="absolute -top-5 -right-5 text-white/5 w-40 h-40" />
        <div className="flex items-start gap-4 relative z-10">
          <AlertCircle className="text-amber-400 shrink-0" size={24} />
          <div>
            <h4 className="font-bold mb-1">Submission Strategy</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Complete all requirements and self-assess using the rubric.
              Document your process to demonstrate structural mastery.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default CapstoneProject;
