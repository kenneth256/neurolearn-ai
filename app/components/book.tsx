"use client";
import React, { useState, useMemo } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Award,
  Lightbulb,
  CheckCircle,
  Hash,
  List,
  Calendar,
  AlertCircle,
} from "lucide-react";
import ConceptSection, { ConceptSectionProps } from "./ui/concept";
import { motion, AnimatePresence, Variants } from "framer-motion";
import TutorBot from "./ui/tutorChat";

interface DailyLesson {
  day: number;
  title: string;
  duration: string;
  learningObjectives: string[];
  commonPitfalls?: string[];
  resources?: any;
  preLessonCheck?: any;
  exitCriteria?: any;
  coreContent?: any;
  handsOnPractice?: any;
  knowledgeChecks?: any;
  practicalApplication?: any;
  spacedRepetition?: any;
}

interface LessonsData {
  moduleTitle: string;
  moduleNumber: number;
  totalDuration: string;
  dailyLessons: DailyLesson[];
  weeklyMilestones?: any[];
  differentiatedLearning?: any;
  assessmentBlueprint?: any;
}

interface CourseBookUIProps {
  course: any;
  lessons: LessonsData | null;
}

const pageVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? -15 : 15,
    x: direction > 0 ? 50 : -50,
    filter: "blur(4px)",
  }),
  animate: {
    opacity: 1,
    rotateY: 0,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      // Fixed: TypeScript now recognizes this as a valid easing function
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? 15 : -15,
    x: direction > 0 ? -50 : 50,
    filter: "blur(4px)",
    transition: {
      duration: 0.4,
    },
  }),
};

const CourseBookUI: React.FC<CourseBookUIProps> = ({ course, lessons }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const modules = course?.filter((item: any) => item.moduleNumber) || [];
  const totalPages = modules.length;
  const currentModule = modules[currentPage];

  const currentSuggestedQuestions = useMemo(() => {
    return [
      `Explain the core of ${currentModule?.moduleName}`,
      "What are the common pitfalls here?",
      "How can I apply this in a real-world project?",
      "Summarize the objectives for me",
    ];
  }, [currentModule]);

  const handlePageChange = (index: number) => {
    if (index === currentPage || index < 0 || index >= totalPages) return;
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative bg-[#f8f6f0] text-slate-800 font-sans selection:bg-amber-200">
      {/* Top Reading Progress Bar */}
      <div>
        <TutorBot
          moduleName={currentModule?.moduleName || "General Study"}
          lessonContext={JSON.stringify({
            module: currentModule?.moduleName,
            objectives: currentModule?.learningObjectives,
            lessons: lessons?.dailyLessons, // Gemini is smart enough to find the relevant parts
          })}
          suggestedQuestions={currentSuggestedQuestions}
        />
      </div>
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200/50 z-50">
        <motion.div
          className="h-full bg-amber-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* LEFT COLUMN: Sidebar Spine */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-12">
              <div className="flex items-center gap-2 mb-8 px-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BookOpen className="text-amber-700" size={20} />
                </div>
                <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400">
                  Curriculum
                </h3>
              </div>
              <nav className="space-y-2">
                {modules.map((mod: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-4 group relative ${
                      idx === currentPage
                        ? "bg-white shadow-xl shadow-amber-900/5 text-amber-700 ring-1 ring-slate-200"
                        : "hover:bg-white/50 text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] ${idx === currentPage ? "opacity-100" : "opacity-40"}`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-bold truncate">
                      {mod.moduleName}
                    </span>
                    {idx === currentPage && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* RIGHT COLUMN: THE PAGE */}
          <main className="relative" style={{ perspective: "1200px" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white min-h-[85vh] rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden relative"
              >
                {/* Skeuomorphic Details */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                <div className="h-2 bg-linear-to-r from-amber-200 via-amber-500 to-amber-200" />

                <div className="p-4 md:p-20">
                  {/* Header Info */}
                  <header className="flex items-center justify-between mb-12">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-amber-100"
                    >
                      Module {currentModule.moduleNumber}
                    </motion.div>
                    <div className="text-slate-300 text-xs font-mono tracking-tighter">
                      Page {currentPage + 1}{" "}
                      <span className="mx-2 text-slate-200">|</span>{" "}
                      {totalPages}
                    </div>
                  </header>

                  <motion.h1
                    layout
                    className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-10 leading-[1.1]"
                  >
                    {currentModule.moduleName}
                  </motion.h1>

                  <div className="grid lg:grid-cols-5 gap-16">
                    <div className="lg:col-span-4 space-y-16">
                      {/* Learning Objectives */}
                      <section className="relative">
                        <div className="absolute -left-6 top-1 w-1 h-6 bg-amber-400 rounded-full" />
                        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-6 text-slate-400">
                          Objectives
                        </h3>
                        <div className="grid gap-4">
                          {currentModule.learningObjectives?.map(
                            (obj: string, i: number) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="group flex gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-white transition-all duration-300"
                              >
                                <CheckCircle
                                  className="text-amber-500 mt-1 shrink-0 group-hover:scale-110 transition-transform"
                                  size={18}
                                />
                                <span className="text-slate-600 font-medium leading-relaxed italic">
                                  {obj}
                                </span>
                              </motion.div>
                            ),
                          )}
                        </div>
                      </section>

                      {/* Content Section */}
                      <section className="space-y-10">
                        {lessons?.dailyLessons?.map(
                          (lesson: any, i: number) => (
                            <div key={i} className="space-y-6">
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">
                                  Day {lesson.day}
                                </span>
                                <h4 className="font-bold text-xl">
                                  {lesson.title}
                                </h4>
                              </div>
                              {lesson.coreContent.concepts.map(
                                (concept: any, id: number) => (
                                  <ConceptSection
                                    key={id}
                                    concept={concept}
                                    index={id}
                                  />
                                ),
                              )}
                            </div>
                          ),
                        )}
                      </section>
                    </div>

                    {/* Meta Sidebar inside the Page */}
                    <div className="space-y-10 w-fit">
                      <div className="p-4 bg-slate-900 rounded-4xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-amber-400 text-xs uppercase tracking-widest">
                          <Clock size={16} /> Commitment
                        </h3>
                        <div className="text-5xl font-serif font-light mb-2">
                          {currentModule.weeklyLearningPlan?.totalHours ||
                            "12h"}
                        </div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">
                          Weekly Intensity
                        </p>
                      </div>

                      <div className="p-8 border border-slate-100 bg-slate-50/30 rounded-4xl">
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-slate-800 text-xs uppercase tracking-widest">
                          <Award size={16} className="text-amber-600" /> Mastery
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                          {currentModule.masteryRequirements?.threshold ||
                            "80% Quiz Accuracy"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Float Navigation */}
            <div className="flex justify-between items-center mt-12 px-4">
              <NavButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                label="Previous"
                icon={<ChevronLeft size={20} />}
              />
              <NavButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                label="Continue"
                icon={<ChevronRight size={20} />}
                isPrimary
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({
  onClick,
  disabled,
  label,
  icon,
  isPrimary = false,
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 disabled:opacity-20 disabled:grayscale ${
      isPrimary
        ? "bg-slate-900 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-900/20"
        : "bg-white text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200"
    }`}
  >
    {!isPrimary && icon}
    <span className="text-sm uppercase tracking-widest">{label}</span>
    {isPrimary && icon}
  </button>
);

export default CourseBookUI;
