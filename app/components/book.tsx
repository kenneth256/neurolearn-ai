"use client";
import React, { useState, useMemo } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Award,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import ConceptSection from "./ui/concept";
import { motion, AnimatePresence, Variants } from "framer-motion";
import TutorBot from "./ui/tutorChat";

// ... (Interfaces remain identical to your provided file)

const bookFlipVariants: Variants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 0 : -95,
    opacity: 0,
    transformOrigin: "left center",
    z: -100,
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    z: 0,
    transition: {
      duration: 0.8,
      ease: [0.645, 0.045, 0.355, 1],
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -95 : 0,
    opacity: 0,
    z: -100,
    transformOrigin: "left center",
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1],
    },
  }),
};

const CourseBookUI: React.FC<CourseBookUIProps> = ({ course, lessons }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const modules = useMemo(
    () => course?.filter((item: any) => item.moduleNumber) || [],
    [course],
  );
  const currentModule = modules[currentPage];
  const totalPages = modules.length;

  const handlePageChange = (index: number) => {
    if (index === currentPage || index < 0 || index >= totalPages) return;
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#d6d2c4] text-slate-900 font-sans selection:bg-amber-200">
      {/* Immersive Background Texture */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row relative">
        {/* --- STICKY & SCROLLABLE INDEX (The Spine) --- */}
        <aside className="w-full lg:w-[320px] lg:h-screen lg:sticky lg:top-0 bg-[#1a1a1a] text-white z-40 flex flex-col shrink-0 border-r border-black/20">
          <div className="p-10 border-b border-white/10 bg-[#1a1a1a] z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-black shadow-lg shadow-amber-500/20">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="font-serif italic text-lg text-amber-100">
                  Index
                </h2>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                  Course Syllabus
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Navigation Area */}
          <nav className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
            {modules.map((mod: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                className={`w-full text-left flex items-center gap-4 transition-all p-3 rounded-xl border border-transparent ${
                  idx === currentPage
                    ? "bg-white/10 text-amber-400 border-white/5 shadow-inner"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span className="font-mono text-[10px] opacity-30 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-[11px] font-black uppercase tracking-widest leading-tight transition-transform ${idx === currentPage ? "translate-x-1" : ""}`}
                >
                  {mod.moduleName}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-8 border-t border-white/10 opacity-30 flex items-center gap-2 bg-[#1a1a1a]">
            <Sparkles size={12} className="text-amber-500" />
            <p className="text-[9px] font-mono uppercase tracking-tighter">
              Gemini 3 Architected
            </p>
          </div>
        </aside>

        {/* --- THE SCROLLABLE PAGE AREA --- */}
        <main
          className="flex-1 relative bg-[#fffcf5] min-h-screen overflow-x-hidden"
          style={{ perspective: "3000px" }}
        >
          {/* THE BINDING GAPS & SHADOWS (Visual connection between Index and Page) */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/40 via-black/5 to-transparent z-30 pointer-events-none" />
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/10 z-30 pointer-events-none" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={bookFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full"
            >
              {/* Natural Paper Fiber Texture */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

              <div className="p-8 md:p-20 relative z-10 max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-16 border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                    <Target size={14} className="text-amber-500" /> Curriculum
                    Folio
                  </div>
                  <div className="font-serif italic text-slate-400 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                </header>

                <div className="space-y-12">
                  <div className="text-amber-600 font-mono text-[11px] font-black uppercase tracking-[0.3em]">
                    Section {currentModule.moduleNumber}
                  </div>

                  <h1 className="text-5xl md:text-8xl font-serif font-bold leading-[1.05] tracking-tight text-slate-900">
                    {currentModule.moduleName}
                  </h1>

                  {/* Objective Annotation Box */}
                  <div className="bg-[#fcf8ee] border-l-[6px] border-amber-300 p-10 rounded-r-3xl shadow-sm italic font-serif text-slate-700">
                    <h4 className="not-italic text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                      <Award size={14} /> Key Objectives
                    </h4>
                    {currentModule.learningObjectives?.map(
                      (obj: string, i: number) => (
                        <div
                          key={i}
                          className="flex gap-4 mb-4 items-start group"
                        >
                          <span className="text-amber-500 font-bold leading-none">
                            ❧
                          </span>
                          <p className="text-xl leading-relaxed group-hover:text-slate-900 transition-colors">
                            {obj}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Main Content Render */}
                  <article className="prose prose-slate max-w-none pt-12">
                    {lessons?.dailyLessons?.map((lesson: any, i: number) => (
                      <div key={i} className="mb-32 last:mb-0">
                        <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-6">
                          <span className="font-serif italic text-amber-600 text-3xl font-bold">
                            Cap. {lesson.day}
                          </span>
                          <h2 className="text-4xl font-bold font-serif text-slate-800 tracking-tight">
                            {lesson.title}
                          </h2>
                        </div>
                        <div className="space-y-20">
                          {lesson.coreContent.concepts.map(
                            (concept: any, idx: number) => (
                              <ConceptSection
                                key={idx}
                                concept={concept}
                                index={idx}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </article>
                </div>

                {/* Folio Footer */}
                <footer className="mt-40 pt-10 border-t border-slate-200 flex justify-between items-center opacity-60">
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Clock size={14} className="text-amber-500" /> Time:{" "}
                    {currentModule.weeklyLearningPlan?.totalHours || "10h"}
                    <Award size={14} className="text-amber-500 ml-6" /> Mastery
                    Grade Required
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-300">
                    NL
                  </div>
                </footer>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PAGE NAVIGATION BUTTONS */}
          <div className="fixed bottom-10 right-10 flex gap-4 z-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-xl hover:bg-amber-50 disabled:opacity-20 transition-all text-slate-600"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-5 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-amber-600 disabled:opacity-20 transition-all scale-110 active:scale-95"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </main>
      </div>

      <TutorBot
        moduleName={currentModule?.moduleName || "Course Folio"}
        lessonContext={JSON.stringify(currentModule)}
        suggestedQuestions={[
          "Summarize this page",
          "Generate a quiz",
          "Explain the concepts",
        ]}
      />
    </div>
  );
};

export default CourseBookUI;
