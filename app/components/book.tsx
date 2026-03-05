"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Award,
  Search,
  Brain,
  Camera,
  LogOut,
  Play,
  Loader2,
  AlertCircle,
  BookDashed,
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
import AdaptiveQuizGenerator from "./ui/AdaptiveQuizGenerator";
import { useRouter } from "next/navigation";
import VideoTutorModal from "./videotutor";
import { useLessonCompletion } from "../hooks/useLessCompletion";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import MoodDetector from "./ui/moodector";
import QuickMoodCheck from "./ui/moodassessmenttriger";
import AutoMoodTrigger from "./ui/automoodtrigger";
import MoodInterventionPopup from "./ui/MoodInterventionPopup";

interface User {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  secondName?: string;
  avatar?: string;
}

interface LessonSectionProps {
  lesson: any;
  lessonIndex: number;
  enrollmentId: string;
  showAnswers: Record<string, boolean>;
  moduleResources?: any;
  exitCriteria?: any;
  spacedRepition: any;
  userId?: string;
  currentModule: any;
  lessonModuleId: string;
  setShowAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

interface CourseBookUIProps {
  course: any[];
  lessons: Record<number, LessonsData>;
  onModuleSelect: (module: any) => void;
  onReset?: () => void;
  enrollmentId?: string;
}

interface InterventionData {
  id: string;
  type: string;
  content: {
    question?: {
      text: string;
      options: Array<{
        text: string;
        correct: boolean;
        explanation: string;
      }>;
      difficulty: string;
    };
    encouragement?: {
      message: string;
      actionItems: string[];
    };
    hint?: {
      level: string;
      text: string;
      relatedConcepts: string[];
    };
    simplification?: {
      simplifiedText: string;
      keyPoints: string[];
      analogy?: string;
    };
  };
  estimatedTime: number;
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
  enrollmentId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<ProjectData | undefined>(undefined);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [detectedMood, setDetectedMood] = useState<any>(null);
  const [showMoodPanel, setShowMoodPanel] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>({});
  const [lessonErrors, setLessonErrors] = useState<Record<number, string>>({});

  const loadingModulesRef = useRef<Set<number>>(new Set());

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

  const isLoadingCurrentModule =
    moduleNumber !== undefined && loadingLessons[moduleNumber];
  const currentModuleError =
    moduleNumber !== undefined ? lessonErrors[moduleNumber] : null;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ ...data.user, userId: data.user.id });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const winScroll = document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - window.innerHeight;
          setReadingProgress(height > 0 ? (winScroll / height) * 100 : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadModuleLessons = useCallback(
    async (module: any) => {
      if (!module || typeof module.moduleNumber !== "number") return;
      const modNum = module.moduleNumber;
      if (loadingModulesRef.current.has(modNum)) return;
      if (lessons[modNum]) return;

      loadingModulesRef.current.add(modNum);
      setLoadingLessons((prev) => ({ ...prev, [modNum]: true }));
      setLessonErrors((prev) => ({ ...prev, [modNum]: "" }));

      try {
        await onModuleSelect(module);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load lessons";
        setLessonErrors((prev) => ({ ...prev, [modNum]: errorMsg }));
      } finally {
        setLoadingLessons((prev) => ({ ...prev, [modNum]: false }));
        loadingModulesRef.current.delete(modNum);
      }
    },
    [onModuleSelect, lessons],
  );

  useEffect(() => {
    if (currentModule && typeof currentModule.moduleNumber === "number") {
      const modNum = currentModule.moduleNumber;
      const moduleData = lessons[modNum];

      if (!moduleData && !loadingModulesRef.current.has(modNum)) {
        loadModuleLessons(currentModule);
      } else if (moduleData) {
        const blueprint = (moduleData[modNum] as any)?.assessmentBlueprint;
        if (blueprint?.finalProject) {
          setData({
            projectTitle: `Capstone: ${currentModule.moduleName}`,
            description: blueprint.finalProject.prompt,
            requirements: blueprint.finalProject.requirements,
            assessmentRubric: blueprint.finalProject.rubric.map((item: string) => ({
              criterion: item.split(":")[0] || "Criteria",
              excellent: "Full implementation exceeding all baseline requirements with optimized logic",
              satisfactory: item.split(":")[1] || item,
              needsWork: "Missing core logic or fails to meet the specified implementation criteria",
            })),
          });
        } else {
          setData(undefined);
        }
      }
    }
  }, [currentModule, lessons, loadModuleLessons]);

  useEffect(() => {
    if (readingProgress > 75 && currentPage < totalPages - 1) {
      const nextModule = modules[currentPage + 1];
      if (
        nextModule &&
        !lessons[nextModule.moduleNumber] &&
        !loadingModulesRef.current.has(nextModule.moduleNumber)
      ) {
        loadModuleLessons(nextModule);
      }
    }
  }, [readingProgress, currentPage, totalPages, modules, lessons, loadModuleLessons]);

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

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.error("Network error during logout:", error);
    }
  };

  const retryLoadLessons = () => {
    if (currentModule) {
      setLessonErrors((prev) => ({ ...prev, [currentModule.moduleNumber]: "" }));
      loadingModulesRef.current.delete(currentModule.moduleNumber);
      loadModuleLessons(currentModule);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#fcfcf9] dark:bg-[#020617] text-[#0f172a] dark:text-[#f8fafc] font-sans transition-colors">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: "#0f172a", color: "#f8fafc", fontFamily: "inherit" },
          success: { duration: 3000, iconTheme: { primary: "#10b981", secondary: "#f8fafc" } },
          error: { duration: 4000, iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
        }}
      />

      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50" role="progressbar" aria-valuenow={Math.round(readingProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
        <motion.div
          className="h-full bg-[#f59e0b] dark:bg-[#fbbf24]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-400 mx-auto flex flex-col lg:flex-row relative">
        <aside className="w-full lg:w-[320px] lg:h-screen lg:sticky lg:top-0 bg-[#0f172a] dark:bg-black text-white z-40 flex flex-col shrink-0 border-r-2 border-slate-800 dark:border-slate-950" aria-label="Course navigation">
          <div className="p-10 border-b-2 border-slate-800 dark:border-slate-950 bg-[#0f172a] dark:bg-black z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f59e0b] dark:bg-[#fbbf24] rounded-lg text-black" aria-hidden="true">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="font-serif italic text-lg text-white font-bold">Index</h2>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Course Syllabus</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <AutoMoodTrigger
                  enrollmentId={enrollmentId}
                  courseModuleId={currentModule?.id}
                  lessonModuleId={filteredLessons[0]?.id}
                  onMoodDetected={(moodResponse) => {
                    setDetectedMood(moodResponse);
                    if (moodResponse.intervention) {
                      setShowMoodPanel(true);
                    }
                  }}
                  triggerInterval={15}
                />
              </div>
            </div>

            <div className="relative mt-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search lessons..."
                aria-label="Search lessons"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 dark:bg-slate-950 border-2 border-slate-700 dark:border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-[#f59e0b] dark:focus:border-[#fbbf24] outline-none transition-colors"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2" aria-label="Course modules">
            {modules.map((mod: any, idx: number) => {
              const isLoading = loadingLessons[mod.moduleNumber];
              const hasError = lessonErrors[mod.moduleNumber];

              return (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  disabled={isLoading}
                  aria-current={idx === currentPage ? "page" : undefined}
                  aria-label={`Module ${idx + 1}: ${mod.moduleName}`}
                  className={cn(
                    "w-full text-left flex items-center gap-4 p-3 rounded-xl border-2 transition-all relative",
                    idx === currentPage
                      ? "bg-[#f59e0b] dark:bg-[#fbbf24] text-black border-[#d97706] dark:border-[#f59e0b] shadow-lg font-bold"
                      : "text-slate-400 hover:text-white border-transparent hover:bg-slate-800 dark:hover:bg-slate-900",
                    isLoading && "opacity-50 cursor-not-allowed",
                    hasError && "border-red-500/50",
                  )}
                >
                  <span className="font-mono text-[10px]">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest flex-1">{mod.moduleName}</span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {hasError && !isLoading && <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 flex flex-col gap-2 border-t-2 border-slate-800 dark:border-slate-950">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#f59e0b] dark:text-[#fbbf24] hover:bg-amber-950/20 rounded-xl transition-all"
            >
              <BookDashed size={18} aria-hidden="true" />
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-950/20 rounded-xl transition-all"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 relative bg-transparent min-h-screen" style={{ perspective: "2000px" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={bookFlipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full min-h-screen bg-white dark:bg-[#0f172a] shadow-2xl"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <div className="p-4 sm:p-8 md:p-20 relative z-10 max-w-5xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-16 border-b-2 border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 dark:text-slate-400">
                    <Target size={14} className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" />
                    Curriculum Folio
                  </div>
                  <div className="font-serif italic text-slate-600 dark:text-slate-400 text-sm" aria-live="polite">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                </header>

                <div aria-live="polite" aria-busy={!!isLoadingCurrentModule}>
                  {isLoadingCurrentModule && (
                    <div className="flex flex-col items-center justify-center py-32" role="status">
                      <Loader2 className="w-16 h-16 text-[#f59e0b] dark:text-[#fbbf24] animate-spin mb-6" aria-hidden="true" />
                      <h3 className="text-2xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] mb-2">Loading Module Content</h3>
                      <p className="text-slate-600 dark:text-slate-400">Preparing lessons for {currentModule?.moduleName}...</p>
                    </div>
                  )}

                  {currentModuleError && !isLoadingCurrentModule && (
                    <div className="flex flex-col items-center justify-center py-32" role="alert">
                      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] mb-2">Failed to Load Lessons</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">{currentModuleError}</p>
                      <button
                        onClick={retryLoadLessons}
                        className="px-6 py-3 bg-[#f59e0b] dark:bg-[#fbbf24] hover:bg-[#d97706] dark:hover:bg-[#f59e0b] text-white rounded-xl font-semibold transition-all shadow-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>

                {!isLoadingCurrentModule && !currentModuleError && (
                  <div className="space-y-12">
                    <div className="text-[#f59e0b] dark:text-[#fbbf24] font-mono text-[11px] font-black uppercase tracking-[0.3em]">
                      Section {currentModule?.moduleNumber}
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold leading-[1.05] text-[#0f172a] dark:text-[#f8fafc] break-words">
                      {currentModule?.moduleName}
                    </h1>

                    <div className="bg-[#fffbeb] dark:bg-amber-950/20 border-l-[4px] sm:border-l-[6px] border-[#f59e0b] dark:border-[#fbbf24] p-6 sm:p-10 rounded-r-2xl sm:rounded-r-3xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-6 sm:mb-8 flex items-center gap-2">
                        <Award size={14} className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" />
                        Key Objectives
                      </h4>
                      {currentModule?.learningObjectives?.map((obj: any, i: number) => (
                        <div key={i} className="flex gap-4 mb-4 items-start">
                          <span className="text-[#f59e0b] dark:text-[#fbbf24] font-bold text-lg sm:text-xl shrink-0" aria-hidden="true">❧</span>
                          <p className="text-base sm:text-xl leading-relaxed text-slate-800 dark:text-slate-200 font-serif italic">
                            {typeof obj === "string" ? obj : obj.objective}
                          </p>
                        </div>
                      ))}
                    </div>

                    {moduleNumber !== undefined && currentLessons?.[moduleNumber]?.differentiatedLearning && (
                      <LearningPath data={currentLessons[moduleNumber].differentiatedLearning} />
                    )}

                    {moduleNumber !== undefined && currentLessons?.[moduleNumber]?.weeklyMilestones && (
                      <Milestones milestones={currentLessons[moduleNumber].weeklyMilestones} />
                    )}

                    <article className="prose prose-slate dark:prose-invert max-w-none pt-12">
                      {filteredLessons.length > 0 ? (
                        filteredLessons.map((lesson: any, lessonIndex: number) => {
                          const lessonId = lesson.id;
                          if (!lessonId) return null;
                          return (
                            <LessonSection
                              key={lessonIndex}
                              lesson={lesson}
                              lessonIndex={lessonIndex}
                              enrollmentId={enrollmentId || ""}
                              showAnswers={showAnswers}
                              setShowAnswers={setShowAnswers}
                              moduleResources={currentModule?.resources}
                              exitCriteria={currentModule?.masteryRequirements}
                              spacedRepition={currentModule?.weeklyLearningPlan}
                              userId={user?.userId}
                              currentModule={currentModule}
                              lessonModuleId={lessonId}
                            />
                          );
                        })
                      ) : (
                        <div className="text-center py-16">
                          <p className="text-slate-500 dark:text-slate-400">No lessons available yet for this module.</p>
                        </div>
                      )}

                      {data && (
                        <div className="mt-16 sm:mt-24 pt-16 sm:pt-24 border-t-4 border-double border-amber-200 dark:border-amber-900/30">
                          <CapstoneProject data={data} />
                        </div>
                      )}
                    </article>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 flex gap-3 sm:gap-4 z-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous module"
              className="p-3 sm:p-4 bg-white dark:bg-[#0f172a] border-2 border-slate-300 dark:border-slate-700 rounded-full shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#0f172a] dark:text-[#f8fafc]" aria-hidden="true" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              aria-label="Next module"
              className="p-3.5 sm:p-5 bg-[#0f172a] dark:bg-[#fbbf24] text-white dark:text-black rounded-full shadow-2xl sm:scale-110 border-2 border-[#0f172a] dark:border-[#fbbf24] disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 sm:hover:scale-115 transition-all"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>

      <div className="fixed bottom-20 right-6 sm:bottom-24 sm:right-6 z-[60]">
        <TutorBot
          moduleName={currentModule?.moduleName || "Course Folio"}
          lessonContext={JSON.stringify(currentModule)}
          suggestedQuestions={["Summarize this page", "Generate a quiz"]}
          enrollmentId={enrollmentId || ""}
          lessonModuleId={filteredLessons[0]?.id || ""}
        />
      </div>

      {showMoodPanel && detectedMood?.intervention && (
        <MoodInterventionPopup
          intervention={{
            id: detectedMood.intervention.id,
            type: detectedMood.intervention.interventionType,
            content: {
              question: detectedMood.intervention.adaptiveQuestion,
              encouragement: detectedMood.intervention.encouragement
                ? { message: detectedMood.intervention.encouragement, actionItems: [] }
                : undefined,
              hint: detectedMood.intervention.hint
                ? { level: "moderate", text: detectedMood.intervention.hint, relatedConcepts: [] }
                : undefined,
              simplification: detectedMood.intervention.simplification,
            },
            estimatedTime: 2,
          }}
          onClose={() => setShowMoodPanel(false)}
          onComplete={(response) => {
            console.log("User response:", response);
            setShowMoodPanel(false);
          }}
        />
      )}
    </div>
  );
};

const LessonSection: React.FC<LessonSectionProps> = ({
  lesson,
  lessonIndex,
  enrollmentId,
  moduleResources,
  exitCriteria,
  spacedRepition,
  showAnswers,
  userId,
  currentModule,
  lessonModuleId,
  setShowAnswers,
}) => {
  const lessonId = `lesson-${lessonIndex}`;
  const { isComplete, toggleComplete } = useLessonProgress(lessonId, lesson.day);
  const { completeLesson, loading: completing } = useLessonCompletion();

  const [showVideoTutor, setShowVideoTutor] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  const lessonEndRef = useRef<HTMLDivElement>(null);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    const checkExistingCompletion = async () => {
      if (!enrollmentId || !lessonModuleId) {
        setIsCheckingCompletion(false);
        return;
      }
      try {
        const response = await fetch(
          `/api/courses/lesson/progress?enrollmentId=${enrollmentId}&lessonModuleId=${lessonModuleId}`,
          { method: "GET", credentials: "include" },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.lessonProgress?.status === "COMPLETED") {
            setHasMarkedComplete(true);
            hasAutoCompletedRef.current = true;
          }
        }
      } catch (error) {
        console.error("Failed to check completion status:", error);
      } finally {
        setIsCheckingCompletion(false);
      }
    };
    checkExistingCompletion();
  }, [enrollmentId, lessonModuleId, lesson.title]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      setTimeSpent(Math.floor(elapsedMs / 60000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lessonEndRef.current || hasAutoCompletedRef.current || isCheckingCompletion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            hasAutoCompletedRef.current = true;
            handleCompleteLesson(true);
          }
        });
      },
      { threshold: 0.5, rootMargin: "0px 0px -100px 0px" },
    );

    observer.observe(lessonEndRef.current);
    return () => observer.disconnect();
  }, [enrollmentId, lessonModuleId, hasMarkedComplete, isCheckingCompletion]);

  const handleReplayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(
      lesson.coreContent?.concepts?.map((c: any) => c.narrativeExplanation).join(" ") || "",
    );
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const handleOpenVideoTutor = () => {
    if (!userId) {
      toast.error("Please log in to generate video");
      return;
    }
    const scriptText =
      lesson.coreContent?.concepts
        ?.map((c: any) => `${c.title}\n${c.narrativeExplanation}`)
        .join("\n\n") || "";
    setCurrentLesson(scriptText);
    setShowVideoTutor(true);
  };

  const handleCompleteLesson = async (isAutoComplete = false) => {
    const finalTimeSpent = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 60000));

    if (!enrollmentId) {
      if (!isAutoComplete) toast.error("Missing enrollment information");
      return;
    }
    if (!lessonModuleId) {
      if (!isAutoComplete) toast.error("Missing lesson module ID");
      return;
    }
    if (hasMarkedComplete) {
      if (!isAutoComplete) toast("This lesson is already completed", { icon: "✅" });
      return;
    }

    try {
      await completeLesson({
        enrollmentId,
        lessonModuleId,
        timeSpentMinutes: finalTimeSpent,
        exercisesCompleted: 0,
        totalExercises: 0,
      });

      setHasMarkedComplete(true);
      hasAutoCompletedRef.current = true;

      if (!isComplete) toggleComplete();

      window.dispatchEvent(new CustomEvent("progressUpdated"));
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      hasAutoCompletedRef.current = false;
    }
  };

  return (
    <>
      <div className="mb-24 sm:mb-40 last:mb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mb-8 sm:mb-16 pb-6 sm:pb-8 border-b-4 border-double border-slate-200 dark:border-slate-800">
          <div className="shrink-0 flex items-center gap-4 sm:block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#f59e0b] dark:bg-[#fbbf24] flex items-center justify-center shadow-lg sm:mb-2">
              <span className="font-serif italic text-white dark:text-black text-xl sm:text-2xl font-bold">{lesson.day}</span>
            </div>
            <span className="hidden sm:block text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#f59e0b] dark:text-[#fbbf24]">Chapter</span>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#0f172a] dark:text-[#f8fafc] mb-3 leading-tight break-words">
              {lesson.title}
            </h2>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" />
                {lesson.duration}
              </span>
              {(isComplete || hasMarkedComplete) && (
                <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Award size={14} className="text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
                  Completed
                </span>
              )}
              {timeSpent > 0 && (
                <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg">
                  <Clock size={14} className="text-blue-600 dark:text-blue-500" aria-hidden="true" />
                  {timeSpent} min
                </span>
              )}
            </div>
          </div>

          <button
            onClick={toggleComplete}
            aria-label={isComplete || hasMarkedComplete ? "Mark lesson as incomplete" : "Mark lesson as complete"}
            aria-pressed={isComplete || hasMarkedComplete}
            className={cn(
              "shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border-2 shadow-md hover:shadow-lg self-end sm:self-center mt-4 sm:mt-0",
              isComplete || hasMarkedComplete
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 border-emerald-300 dark:border-emerald-800"
                : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24]",
            )}
          >
            <Award className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          </button>
        </div>

        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <PreLessonCheck checks={lesson.learningObjectives.map((obj: any) => obj.objective)} />
        )}

        {spacedRepition && <SpacedRepetition data={spacedRepition} />}

        <div className="space-y-16 sm:space-y-32">
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
          <div className="my-16 sm:my-32">
            <InteractiveQuiz
              questions={lesson.knowledgeChecks.questions.map((q: any) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.options.findIndex((opt: string) => opt === q.correctAnswer),
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

        <div className="mt-16 sm:mt-32 pt-12 sm:pt-16 border-t-4 border-double border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-center">
            <button
              onClick={handleOpenVideoTutor}
              aria-label="Generate AI video lecture for this lesson"
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] hover:from-[#d97706] hover:to-[#f59e0b] dark:hover:from-[#f59e0b] dark:hover:to-[#fbbf24] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-amber-500/50 flex items-center justify-center gap-3"
            >
              <Play size={20} aria-hidden="true" />
              Generate AI Video Lecture
            </button>

            {enrollmentId && (
              <button
                onClick={() => handleCompleteLesson(false)}
                disabled={completing || hasMarkedComplete}
                aria-label={hasMarkedComplete ? "Lesson already completed" : "Mark this lesson as complete"}
                aria-disabled={completing || hasMarkedComplete}
                className={cn(
                  "w-full md:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center",
                  completing || hasMarkedComplete
                    ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/50",
                )}
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" aria-hidden="true" />
                    Saving Progress...
                  </>
                ) : hasMarkedComplete ? (
                  <>
                    <Award className="w-5 h-5 inline mr-2" aria-hidden="true" />
                    Lesson Complete ✓
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5 inline mr-2" aria-hidden="true" />
                    Mark Lesson as Complete
                  </>
                )}
              </button>
            )}
          </div>

          {timeSpent > 0 && (
            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              <p>
                You've spent{" "}
                <strong>{timeSpent} minute{timeSpent !== 1 ? "s" : ""}</strong>{" "}
                on this lesson
              </p>
            </div>
          )}

          <div ref={lessonEndRef} className="h-1 w-full mt-16" aria-hidden="true" />
        </div>
      </div>

      {showVideoTutor && (
        <VideoTutorModal
          showVideoTutor={showVideoTutor}
          isGeneratingVideo={false}
          currentVideoUrl=""
          videoScript={currentLesson}
          lessonContent={lesson.coreContent}
          userId={userId || ""}
          onClose={() => setShowVideoTutor(false)}
          onReplayAudio={handleReplayAudio}
        />
      )}
    </>
  );
};

export default CourseBookUI;