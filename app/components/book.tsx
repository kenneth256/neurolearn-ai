"use client";
import React, { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Award,
  Search,
} from "lucide-react";
import ConceptSection from "./ui/concept";
import { motion, AnimatePresence, Variants } from "framer-motion";
import TutorBot from "./ui/tutorChat";
import CapstoneProject, { type ProjectData } from "./ui/protocol";
import { type LessonsData, cn } from "../constants/utils";
import InteractiveQuiz from "./ui/t";
import { useLessonProgress } from "./ui/progress";
import { ThemeToggle } from "./ui/theme";
import LearningPath from "./ui/learning";
import CommonPitfalls from "./ui/commonPitFall";
import Milestones from "./ui/Milestone";
import {
  ExitCriteria,
  PracticalApplication,
  PreLessonCheck,
  ResourcesSection,
  SpacedRepetition,
} from "./ui/majorUi";

interface CourseBookUIProps {
  course: any[];
  lessons: Record<number, LessonsData>;
  onModuleSelect: (module: any) => void;
  onReset?: () => void;
}

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
      ease: [0.25, 0.46, 0.45, 0.94],
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

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      setReadingProgress(scrolled);
    };

    const debouncedScroll = debounce(handleScroll, 50);
    window.addEventListener("scroll", debouncedScroll);
    return () => window.removeEventListener("scroll", debouncedScroll);
  }, []);

  useEffect(() => {
    if (readingProgress > 75 && currentPage < totalPages - 1) {
      const nextModule = modules[currentPage + 1];
      if (nextModule && !lessons[nextModule.moduleNumber]) {
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

  useEffect(() => {
    if (currentModule && typeof currentModule.moduleNumber === "number") {
      const moduleData = lessons[currentModule.moduleNumber];

      if (!moduleData) {
        onModuleSelect(currentModule);
      } else {
        console.log(moduleData);
        const blueprint = (moduleData[currentModule.moduleNumber] as any)
          ?.assessmentBlueprint;
        console.log(blueprint);
        if (blueprint?.finalProject) {
          setData({
            projectTitle: `Capstone: ${currentModule.moduleName}`,
            description: blueprint.finalProject.prompt,
            requirements: blueprint.finalProject.requirements,
            assessmentRubric: blueprint.finalProject.rubric.map(
              (item: string) => ({
                criterion: item.split(":")[0] || "Criteria",
                excellent:
                  "Full implementation exceeding all baseline requirements with optimized logic",
                satisfactory: item.split(":")[1] || item,
                needsWork:
                  "Missing core logic or fails to meet the specified implementation criteria",
              }),
            ),
          });
        } else {
          setData(undefined);
        }
      }
    }
  }, [currentModule, lessons, onModuleSelect]);

  const handlePageChange = (index: number) => {
    if (index === currentPage || index < 0 || index >= totalPages) return;
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredLessons = searchQuery
    ? dailyLessons.filter((lesson: any) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : dailyLessons;

  console.log(currentModule?.masteryRequirements);
  console.log("Current module", currentModule.weeklyLearningPlan);
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <motion.div
          className="h-full bg-amber-500 dark:bg-amber-400"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-400 mx-auto flex flex-col lg:flex-row relative">
        <aside className="w-full lg:w-[320px] lg:h-screen lg:sticky lg:top-0 bg-gray-900 dark:bg-black text-white z-40 flex flex-col shrink-0 border-r-2 border-gray-800 dark:border-gray-900">
          <div className="p-10 border-b-2 border-gray-800 dark:border-gray-900 bg-gray-900 dark:bg-black z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 dark:bg-amber-400 rounded-lg text-black">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-800 dark:bg-gray-950 border-2 border-gray-700 dark:border-gray-800 rounded-lg text-sm text-white focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
            {modules.map((mod: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                className={cn(
                  "w-full text-left flex items-center gap-4 p-3 rounded-xl border-2 transition-all",
                  idx === currentPage
                    ? "bg-amber-500 dark:bg-amber-600 text-black border-amber-400 shadow-lg font-bold"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-gray-800",
                )}
              >
                <span className="font-mono text-[10px]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {mod.moduleName}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main
          className="flex-1 relative bg-transparent min-h-screen"
          style={{ perspective: "2000px" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={bookFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full min-h-screen bg-white dark:bg-gray-900 shadow-2xl"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="p-8 md:p-20 relative z-10 max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-16 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 dark:text-gray-400">
                    <Target size={14} className="text-amber-500" />
                    Curriculum Folio
                  </div>
                  <div className="font-serif italic text-gray-600 text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                </header>

                <div className="space-y-12">
                  <div className="text-amber-600 font-mono text-[11px] font-black uppercase tracking-[0.3em]">
                    Section {currentModule.moduleNumber}
                  </div>
                  <h1 className="text-5xl md:text-8xl font-serif font-bold leading-[1.05] text-gray-900 dark:text-gray-100">
                    {currentModule.moduleName}
                  </h1>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-[6px] border-amber-500 p-10 rounded-r-3xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-8 flex items-center gap-2">
                      <Award size={14} className="text-amber-500" />
                      Key Objectives
                    </h4>
                    {currentModule.learningObjectives?.map(
                      (obj: any, i: number) => (
                        <div key={i} className="flex gap-4 mb-4 items-start">
                          <span className="text-amber-600 font-bold text-xl">
                            ❧
                          </span>
                          <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-serif italic">
                            {typeof obj === "string" ? obj : obj.objective}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  {moduleNumber !== undefined &&
                    currentLessons?.[moduleNumber]?.differentiatedLearning && (
                      <LearningPath
                        data={
                          currentLessons[moduleNumber].differentiatedLearning
                        }
                      />
                    )}

                  {moduleNumber !== undefined &&
                    currentLessons?.[moduleNumber]?.weeklyMilestones && (
                      <Milestones
                        milestones={
                          currentLessons[moduleNumber].weeklyMilestones
                        }
                      />
                    )}

                  <article className="prose prose-slate dark:prose-invert max-w-none pt-12">
                    {filteredLessons.map((lesson: any, lessonIndex: number) => (
                      <LessonSection
                        key={lessonIndex}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        showAnswers={showAnswers}
                        setShowAnswers={setShowAnswers}
                        moduleResources={currentModule?.resources}
                        exitCriteria={currentModule?.masteryRequirements}
                        spacedRepition={currentModule.weeklyLearningPlan}
                      />
                    ))}

                    {data && (
                      <div className="mt-24 pt-24 border-t-4 border-double border-amber-200 dark:border-amber-900/30">
                        <CapstoneProject data={data} />
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="fixed bottom-10 right-10 flex gap-4 z-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-4 bg-white dark:bg-gray-900 border-2 border-gray-300 rounded-full shadow-2xl disabled:opacity-20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-5 bg-gray-900 dark:bg-amber-600 text-white rounded-full shadow-2xl scale-110 border-2"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </main>
      </div>

      <div className="fixed bottom-6 left-6 z-[60]">
        <TutorBot
          moduleName={currentModule?.moduleName || "Course Folio"}
          lessonContext={JSON.stringify(currentModule)}
          suggestedQuestions={["Summarize this page", "Generate a quiz"]}
        />
      </div>
    </div>
  );
};

const LessonSection: React.FC<{
  lesson: any;
  lessonIndex: number;
  showAnswers: Record<string, boolean>;
  moduleResources?: any;
  exitCriteria?: any;
  spacedRepition: any;
  setShowAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}> = ({
  lesson,
  lessonIndex,
  moduleResources,
  exitCriteria,
  spacedRepition,
  showAnswers,
  setShowAnswers,
}) => {
  const lessonId = `lesson-${lessonIndex}`;
  const { isComplete, toggleComplete } = useLessonProgress(
    lessonId,
    lesson.day,
  );

  return (
    <div className="mb-32 last:mb-0">
      <div className="flex items-center gap-6 mb-12 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
        <span className="font-serif italic text-amber-600 text-3xl font-bold">
          Cap. {lesson.day}
        </span>
        <div className="flex-1">
          <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-gray-100">
            {lesson.title}
          </h2>
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
            <Clock size={12} className="text-amber-500" />
            Allocated: {lesson.duration}
          </span>
        </div>
        <button
          onClick={toggleComplete}
          className={cn(
            "p-3 rounded-full transition-all border-2",
            isComplete
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-gray-100 text-gray-500 border-gray-300",
          )}
        >
          <Award size={24} />
        </button>
      </div>

      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <PreLessonCheck
          checks={lesson.learningObjectives.map((obj: any) => obj.objective)}
        />
      )}

      {spacedRepition && <SpacedRepetition data={spacedRepition} />}

      <div className="space-y-24">
        {lesson.coreContent?.concepts?.map((concept: any, idx: number) => {
          const isLastConcept = idx === lesson.coreContent.concepts.length - 1;

          const exercises =
            isLastConcept && lesson.handsOnPractice?.exercises
              ? Array.isArray(lesson.handsOnPractice.exercises)
                ? lesson.handsOnPractice.exercises
                : [lesson.handsOnPractice.exercises]
              : [];

          return (
            <ConceptSection
              key={idx}
              index={idx}
              concept={{
                title: concept.title,
                narrativeExplanation: concept.narrativeExplanation,
                interactiveAnalogy: concept.interactiveAnalogy,
                edgeCase: concept.edgeCase,
                socraticInquiry: concept.socraticInquiry,
                handsOnPractice: concept.handsOnTask,
                codeWalkthrough: concept.codeWalkthrough,
              }}
              exercises={exercises}
            />
          );
        })}
      </div>

      {lesson.knowledgeChecks?.questions && (
        <div className="my-24">
          <InteractiveQuiz
            questions={lesson.knowledgeChecks.questions.map((q: any) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.options.findIndex(
                (opt: string) => opt === q.correctAnswer,
              ),
              explanation: q.feedback,
            }))}
            lessonTitle={lesson.title}
          />
        </div>
      )}

      {lesson.commonPitfalls && lesson.commonPitfalls.length > 0 && (
        <CommonPitfalls pitfalls={lesson.commonPitfalls} />
      )}

      {lesson.practicalApplication && (
        <PracticalApplication data={lesson.practicalApplication} />
      )}

      {moduleResources && <ResourcesSection resources={moduleResources} />}

      {exitCriteria && <ExitCriteria criteria={exitCriteria} />}
    </div>
  );
};

export default CourseBookUI;
