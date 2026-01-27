"use client";
import React, { useState, useMemo, useEffect } from "react";
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
import CapstoneProject, { ProjectData } from "./ui/protocol";

interface DailyLesson {
  day: number;
  title: string;
  duration: string;
  learningObjectives: string[];
  coreContent: { concepts: any[] };
}

interface LessonsData {
  moduleTitle: string;
  moduleNumber: number;
  totalDuration: string;
  dailyLessons: DailyLesson[];
  moduleCapstone?: ProjectData;
  [key: number]: {
    dailyLessons: DailyLesson[];
    moduleCapstone?: ProjectData;
  };
}

interface CourseBookUIProps {
  course: any[];
  lessons: Record<number, LessonsData>;
  onModuleSelect: (module: any) => void;
  onReset?: () => void;
}

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

const CourseBookUI: React.FC<CourseBookUIProps> = ({
  course,
  lessons,
  onModuleSelect,
  onReset,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<ProjectData | undefined>(undefined);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  const modules = useMemo(
    () => course?.filter((item: any) => item.moduleNumber) || [],
    [course],
  );
  const currentModule = modules[currentPage];

  const totalPages = modules.length;
  const moduleNumber: number | undefined = currentModule?.moduleNumber;

  const currentLessons = moduleNumber ? lessons[moduleNumber] : undefined;
  const dailyLessons =
    moduleNumber && currentLessons?.[moduleNumber]?.dailyLessons
      ? currentLessons[moduleNumber].dailyLessons
      : [];

  // Auto-trigger module generation when page changes
  useEffect(() => {
    if (currentModule && typeof currentModule.moduleNumber === "number") {
      const moduleLessons = lessons[currentModule.moduleNumber];

      // If lessons don't exist for this module, trigger generation
      if (!moduleLessons) {
        console.log(
          `🎯 Triggering generation for Module ${currentModule.moduleNumber}...`,
        );
        onModuleSelect(currentModule);
      } else {
        // Update capstone data if lessons exist
        setData(moduleLessons?.moduleCapstone);
      }
    }
  }, [currentModule, lessons, onModuleSelect]);

  const handlePageChange = (index: number) => {
    if (index === currentPage || index < 0 || index >= totalPages) return;

    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  console.log("Current Module:", currentModule);
  console.log("Current Module Number:", currentModule?.moduleNumber);
  console.log("All Lessons:", lessons);
  console.log("Current Lessons:", currentLessons);

  return (
    <div className="min-h-screen bg-[#d6d2c4] text-slate-900 font-sans selection:bg-amber-200">
      {/* Immersive Background Texture */}
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-400 mx-auto flex flex-col lg:flex-row relative">
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
            {modules.map((mod: any, idx: number) => {
              const hasLessons =
                typeof mod.moduleNumber === "number"
                  ? lessons[mod.moduleNumber]
                  : false;
              return (
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
                  {!hasLessons && (
                    <Sparkles
                      size={12}
                      className="text-amber-500 animate-pulse ml-auto"
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-6 border-t border-white/10 bg-[#1a1a1a] space-y-3">
            {onReset && (
              <button
                onClick={onReset}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-all"
              >
                Start New Course
              </button>
            )}
            <div className="opacity-30 flex items-center gap-2 justify-center">
              <Sparkles size={12} className="text-amber-500" />
              <p className="text-[9px] font-mono uppercase tracking-tighter">
                Gemini 3 Architected
              </p>
            </div>
          </div>
        </aside>

        {/* --- THE SCROLLABLE PAGE AREA --- */}
        <main
          className="flex-1 relative bg-[#fffcf5] min-h-screen overflow-x-hidden"
          style={{ perspective: "3000px" }}
        >
          {/* THE BINDING GAPS & SHADOWS (Visual connection between Index and Page) */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-black/40 via-black/5 to-transparent z-30 pointer-events-none" />
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 z-30 pointer-events-none" />

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

                  {/* Loading state when lessons are being generated */}
                  {!currentLessons || dailyLessons.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
                      <p className="text-xl font-serif italic text-slate-600">
                        Crafting your lessons...
                      </p>
                      <p className="text-sm text-slate-400">
                        The AI architect is building deep-dive content for this
                        module
                      </p>
                    </div>
                  ) : (
                    <article className="prose prose-slate max-w-none pt-12">
                      {dailyLessons.map((lesson: any, lessonIndex: number) => (
                        <div key={lessonIndex} className="mb-32 last:mb-0">
                          <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-6">
                            <span className="font-serif italic text-amber-600 text-3xl font-bold">
                              Cap. {lesson.day}
                            </span>
                            <h2 className="text-4xl font-bold font-serif text-slate-800 tracking-tight">
                              {lesson.title}
                            </h2>
                          </div>

                          <p className="text-slate-600 mb-4">
                            Duration: {lesson.duration}
                          </p>

                          {lesson.coreContent?.concepts?.map(
                            (concept: any, idx: number) => (
                              <ConceptSection
                                key={idx}
                                index={idx}
                                concept={{
                                  conceptTitle: concept.concept,
                                  deepDive: concept.narrativeExplanation,
                                  realWorldApplication: concept.whyScenario,
                                  commonMisconceptions: concept.gotcha,
                                  codeWalkthrough: concept.codeWalkthrough
                                    ? {
                                        code: concept.codeWalkthrough.code,
                                        language:
                                          concept.codeWalkthrough.language,
                                        analysis:
                                          concept.codeWalkthrough.analysis,
                                      }
                                    : undefined,
                                }}
                              />
                            ),
                          )}

                          {lesson.knowledgeChecks?.questions?.map(
                            (q: any, qIdx: any) => (
                              <div
                                key={qIdx}
                                className="my-6 p-6 bg-amber-50 rounded-lg"
                              >
                                <p className="font-bold mb-3">{q.question}</p>
                                {showAnswers[`${lessonIndex}-${qIdx}`] ? (
                                  <ul className="space-y-2">
                                    {q.options.map(
                                      (option: string, oIdx: number) => (
                                        <li key={oIdx}>{option}</li>
                                      ),
                                    )}
                                  </ul>
                                ) : (
                                  <p
                                    className="text-m text-black/75 cursor-pointer"
                                    onClick={() =>
                                      setShowAnswers((prev) => ({
                                        ...prev,
                                        [`${lessonIndex}-${qIdx}`]: true,
                                      }))
                                    }
                                  >
                                    show answers!
                                  </p>
                                )}
                              </div>
                            ),
                          )}

                          {lesson.handsOnPractice?.tasks && (
                            <div className="my-6 p-6 bg-blue-50 rounded-lg">
                              <h3 className="font-bold mb-3">
                                Practice Tasks:
                              </h3>
                              <ul className="space-y-2">
                                {lesson.handsOnPractice.tasks.map(
                                  (task: string, tIdx: number) => (
                                    <li key={tIdx}>{task}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      {data && <CapstoneProject data={data} />}
                    </article>
                  )}
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
