// components/book-enhanced.tsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Award,
  Sparkles,
  Download,
  Search,
  TrendingUp,
} from "lucide-react";
import ConceptSection from "./ui/concept";
import { motion, AnimatePresence, Variants } from "framer-motion";
import TutorBot from "./ui/tutorChat";
import CapstoneProject, { ProjectData } from "./ui/protocol";
import type { LessonsData, DailyLesson } from "../constants/utils";
import InteractiveQuiz from "./ui/t";
import { useLessonProgress } from "./ui/progress";
import { ThemeToggle } from "./ui/theme";

interface CourseBookUIProps {
  course: any[];
  lessons: Record<number, LessonsData>;
  onModuleSelect: (module: any) => void;
  onReset?: () => void;
}

// Realistic book page flip animation - like turning pages in a real book
const bookFlipVariants: Variants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 180 : -180,
    opacity: 0,
    transformOrigin: direction > 0 ? "left center" : "right center",
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom smooth curve
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -180 : 180,
    opacity: 0,
    transformOrigin: direction > 0 ? "right center" : "left center",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
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
  const [searchQuery, setSearchQuery] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

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

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prefetch next module when 75% through current
  useEffect(() => {
    if (readingProgress > 75 && currentPage < totalPages - 1) {
      const nextModule = modules[currentPage + 1];
      if (nextModule && !lessons[nextModule.moduleNumber]) {
        console.log("🔮 Prefetching next module...");
        onModuleSelect(nextModule);
      }
    }
  }, [
    readingProgress,
    currentPage,
    totalPages,
    modules,
    lessons,
    onModuleSelect,
  ]);

  // Auto-trigger module generation when page changes
  useEffect(() => {
    if (currentModule && typeof currentModule.moduleNumber === "number") {
      const moduleLessons = lessons[currentModule.moduleNumber];

      if (!moduleLessons) {
        console.log(
          `🎯 Triggering generation for Module ${currentModule.moduleNumber}...`,
        );
        onModuleSelect(currentModule);
      } else {
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

  // Filter lessons by search query
  const filteredLessons = searchQuery
    ? dailyLessons.filter((lesson: any) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : dailyLessons;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-900 transition-colors">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <motion.div
          className="h-full bg-amber-500 dark:bg-amber-400"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Background Texture */}
      <div className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-400 mx-auto flex flex-col lg:flex-row relative">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-[320px] lg:h-screen lg:sticky lg:top-0 bg-gray-900 dark:bg-black text-white z-40 flex flex-col shrink-0 border-r-2 border-gray-800 dark:border-gray-900">
          <div className="p-10 border-b-2 border-gray-800 dark:border-gray-900 bg-gray-900 dark:bg-black z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 dark:bg-amber-400 rounded-lg text-black shadow-lg shadow-amber-500/30">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="font-serif italic text-lg text-white font-bold">
                    Index
                  </h2>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                    Course Syllabus
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 dark:bg-gray-950 border-2 border-gray-700 dark:border-gray-800 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="p-6 border-b-2 border-gray-800 dark:border-gray-900">
            <div className="bg-gray-800 dark:bg-gray-950 rounded-2xl p-4 border-2 border-gray-700 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                  size={16}
                  className="text-amber-500 dark:text-amber-400"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Progress
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Completion</span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round((currentPage / totalPages) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 dark:bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
                  className={`w-full text-left flex items-center gap-4 transition-all p-3 rounded-xl border-2 ${
                    idx === currentPage
                      ? "bg-amber-500 dark:bg-amber-600 text-black dark:text-white border-amber-400 dark:border-amber-500 shadow-lg font-bold"
                      : "text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-900 border-transparent hover:border-gray-700 dark:hover:border-gray-800"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] shrink-0 ${idx === currentPage ? "text-black dark:text-white opacity-60" : "opacity-40"}`}
                  >
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
                      className="text-amber-400 animate-pulse ml-auto"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 border-t-2 border-gray-800 dark:border-gray-900 bg-gray-900 dark:bg-black space-y-3">
            {onReset && (
              <button
                onClick={onReset}
                className="w-full py-3 px-4 bg-gray-800 dark:bg-gray-950 hover:bg-amber-500 dark:hover:bg-amber-600 border-2 border-gray-700 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-600 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-black dark:hover:text-white transition-all"
              >
                Start New Course
              </button>
            )}
            <div className="flex items-center gap-2 justify-center text-gray-500">
              <Sparkles
                size={12}
                className="text-amber-500 dark:text-amber-400"
              />
              <p className="text-[9px] font-mono uppercase tracking-tighter">
                GEMINI Powered Learning
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT - Book page with 3D perspective */}
        <main
          className="flex-1 relative bg-transparent min-h-screen"
          style={{
            perspective: "2000px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={bookFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full min-h-screen"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Book page with shadow and texture */}
              <div className="relative w-full min-h-screen bg-white dark:bg-gray-900 shadow-2xl">
                {/* Book spine shadow */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/30 dark:from-black/50 via-black/10 dark:via-black/20 to-transparent pointer-events-none" />

                {/* Vertical book binding line */}
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gray-300 dark:bg-gray-700 pointer-events-none" />

                {/* Paper texture */}
                <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                <div className="p-8 md:p-20 relative z-10 max-w-5xl mx-auto">
                  <header className="flex justify-between items-center mb-16 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 dark:text-gray-400">
                      <Target
                        size={14}
                        className="text-amber-500 dark:text-amber-400"
                      />
                      Curriculum Folio
                    </div>
                    <div className="font-serif italic text-gray-600 dark:text-gray-400 text-sm font-bold">
                      Page {currentPage + 1} of {totalPages}
                    </div>
                  </header>

                  <div className="space-y-12">
                    <div className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-black uppercase tracking-[0.3em]">
                      Section {currentModule.moduleNumber}
                    </div>

                    <h1 className="text-5xl md:text-8xl font-serif font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-gray-100">
                      {currentModule.moduleName}
                    </h1>

                    {/* Learning Objectives */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-l-[6px] border-amber-500 dark:border-amber-400 p-10 rounded-r-3xl shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-8 flex items-center gap-2">
                        <Award
                          size={14}
                          className="text-amber-500 dark:text-amber-400"
                        />
                        Key Objectives
                      </h4>
                      {currentModule.learningObjectives?.map(
                        (obj: string, i: number) => (
                          <div
                            key={i}
                            className="flex gap-4 mb-4 items-start group"
                          >
                            <span className="text-amber-600 dark:text-amber-400 font-bold leading-none text-xl">
                              ❧
                            </span>
                            <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors font-serif italic">
                              {obj}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Loading or Content */}
                    {!currentLessons || filteredLessons.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <Sparkles className="w-12 h-12 text-amber-500 dark:text-amber-400 animate-pulse" />
                        <p className="text-xl font-serif italic text-gray-700 dark:text-gray-300 font-bold">
                          {searchQuery
                            ? "No lessons match your search"
                            : "Crafting your lessons..."}
                        </p>
                        {!searchQuery && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            The AI architect is building deep-dive content for
                            this module
                          </p>
                        )}
                      </div>
                    ) : (
                      <article className="prose prose-slate dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 max-w-none pt-12">
                        {filteredLessons.map(
                          (lesson: any, lessonIndex: number) => (
                            <LessonSection
                              key={lessonIndex}
                              lesson={lesson}
                              lessonIndex={lessonIndex}
                              showAnswers={showAnswers}
                              setShowAnswers={setShowAnswers}
                            />
                          ),
                        )}
                        {data && <CapstoneProject data={data} />}
                      </article>
                    )}
                  </div>

                  {/* Footer */}
                  <footer className="mt-40 pt-10 border-t-2 border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                      <Clock
                        size={14}
                        className="text-amber-500 dark:text-amber-400"
                      />
                      Time:{" "}
                      {currentModule.weeklyLearningPlan?.totalHours || "10h"}
                      <Award
                        size={14}
                        className="text-amber-500 dark:text-amber-400 ml-6"
                      />
                      Mastery Grade Required POWERED BY GEMINI
                    </div>
                  </footer>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="fixed bottom-10 right-10 flex gap-4 z-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-4 bg-white dark:bg-gray-900 backdrop-blur-md border-2 border-gray-300 dark:border-gray-700 rounded-full shadow-2xl hover:bg-amber-50 dark:hover:bg-gray-800 hover:border-amber-500 dark:hover:border-amber-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-5 bg-gray-900 dark:bg-amber-600 text-white rounded-full shadow-2xl hover:bg-amber-600 dark:hover:bg-amber-700 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed transition-all scale-110 active:scale-95 border-2 border-gray-800 dark:border-amber-500"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </main>
      </div>

      <div className="fixed bottom-28 right-6 z-[100]">
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
    </div>
  );
};

// Lesson Section Component
const LessonSection: React.FC<{
  lesson: any;
  lessonIndex: number;
  showAnswers: Record<string, boolean>;
  setShowAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}> = ({ lesson, lessonIndex, showAnswers, setShowAnswers }) => {
  const lessonId = `lesson-${lessonIndex}`;
  const { isComplete, toggleComplete } = useLessonProgress(
    lessonId,
    lesson.day,
  );

  return (
    <div className="mb-32 last:mb-0">
      <div className="flex items-center gap-6 mb-12 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
        <span className="font-serif italic text-amber-600 dark:text-amber-400 text-3xl font-bold">
          Cap. {lesson.day}
        </span>
        <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-gray-100 tracking-tight flex-1">
          {lesson.title}
        </h2>
        <button
          onClick={toggleComplete}
          className={`p-3 rounded-full transition-all border-2 ${
            isComplete
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-400"
          }`}
        >
          <Award size={24} />
        </button>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 font-semibold">
        Duration: {lesson.duration}
      </p>

      {lesson.coreContent?.concepts?.map((concept: any, idx: number) => {
        const conceptTitle = concept.concept;
        const uniqueId = `concept-${lessonIndex}-${idx}`;

        return (
          <div
            key={idx}
            data-concept-block
            data-concept-id={uniqueId}
            data-concept-title={conceptTitle}
          >
            <ConceptSection
              index={idx}
              concept={{
                conceptTitle: concept.concept,
                deepDive: concept.narrativeExplanation,
                realWorldApplication: concept.whyScenario,
                commonMisconceptions: concept.gotcha,
                codeWalkthrough: concept.codeWalkthrough
                  ? {
                      code: concept.codeWalkthrough.code,
                      language: concept.codeWalkthrough.language,
                      analysis: concept.codeWalkthrough.analysis,
                    }
                  : undefined,
              }}
            />
          </div>
        );
      })}

      {/* Interactive Quiz */}
      {lesson.knowledgeChecks?.questions &&
        lesson.knowledgeChecks.questions.length > 0 && (
          <div className="my-12">
            <InteractiveQuiz
              questions={lesson.knowledgeChecks.questions.map(
                (q: any, idx: number) => ({
                  question: q.question,
                  options: q.options,
                  correctAnswer: 0,
                  explanation: "Great job!",
                }),
              )}
              lessonTitle={lesson.title}
            />
          </div>
        )}

      {lesson.handsOnPractice?.tasks && (
        <div className="my-6 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-300 dark:border-blue-800">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Target size={20} className="text-blue-600 dark:text-blue-400" />
            Practice Tasks:
          </h3>
          <ul className="space-y-2">
            {lesson.handsOnPractice.tasks.map((task: string, tIdx: number) => (
              <li
                key={tIdx}
                className="flex items-start gap-3 text-gray-800 dark:text-gray-200"
              >
                <span className="text-blue-600 dark:text-blue-400 mt-1 font-bold">
                  →
                </span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseBookUI;
