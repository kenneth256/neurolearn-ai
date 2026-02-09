"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import debounce from "lodash.debounce";
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
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>(
    {},
  );
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
          setUser({
            ...data.user,
            userId: data.user.id,
          });
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

  const loadModuleLessons = useCallback(
    async (module: any) => {
      if (!module || typeof module.moduleNumber !== "number") return;

      const modNum = module.moduleNumber;

      if (loadingModulesRef.current.has(modNum)) {
        console.log(`Module ${modNum} is already being loaded, skipping...`);
        return;
      }

      if (lessons[modNum]) {
        console.log(`Module ${modNum} lessons already loaded`);
        return;
      }

      console.log(`Loading lessons for module ${modNum}:`, module.moduleName);

      loadingModulesRef.current.add(modNum);
      setLoadingLessons((prev) => ({ ...prev, [modNum]: true }));
      setLessonErrors((prev) => ({ ...prev, [modNum]: "" }));

      try {
        await onModuleSelect(module);
        console.log(`Successfully loaded lessons for module ${modNum}`);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load lessons";
        console.error(`Error loading lessons for module ${modNum}:`, errorMsg);
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
        console.log("Module data already loaded:", moduleData);
        const blueprint = (moduleData[modNum] as any)?.assessmentBlueprint;

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
  }, [currentModule, lessons, loadModuleLessons]);

  useEffect(() => {
    if (readingProgress > 75 && currentPage < totalPages - 1) {
      const nextModule = modules[currentPage + 1];
      if (
        nextModule &&
        !lessons[nextModule.moduleNumber] &&
        !loadingModulesRef.current.has(nextModule.moduleNumber)
      ) {
        console.log("Prefetching next module:", nextModule.moduleName);
        loadModuleLessons(nextModule);
      }
    }
  }, [
    readingProgress,
    currentPage,
    totalPages,
    modules,
    lessons,
    loadModuleLessons,
  ]);

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

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      ENGAGED: "bg-green-400",
      NEUTRAL: "bg-gray-400",
      BORED: "bg-yellow-400",
      FRUSTRATED: "bg-red-400",
      CONFUSED: "bg-orange-400",
      EXCITED: "bg-purple-400",
      OVERWHELMED: "bg-pink-400",
    };
    return colors[mood] || "bg-gray-300";
  };

  const generateInterventionFromMood = (
    mood: any,
    currentLesson: any,
  ): InterventionData => {
    if (mood.mood === "FRUSTRATED" || mood.mood === "CONFUSED") {
      return {
        id: `intervention-${Date.now()}`,
        type: "ENCOURAGEMENT",
        content: {
          encouragement: {
            message:
              "It's okay to feel stuck! Learning new concepts takes time.",
            actionItems: [
              "Take a 2-minute break and come back fresh",
              "Re-read the previous section slowly",
              "Try explaining the concept out loud to yourself",
              "Ask the AI tutor for help",
            ],
          },
        },
        estimatedTime: 3,
      };
    }

    if (mood.mood === "OVERWHELMED") {
      return {
        id: `intervention-${Date.now()}`,
        type: "BREAK_SUGGESTION",
        content: {},
        estimatedTime: 5,
      };
    }

    if (mood.mood === "BORED") {
      return {
        id: `intervention-${Date.now()}`,
        type: "ENCOURAGEMENT",
        content: {
          encouragement: {
            message: "Let's make this more interesting!",
            actionItems: [
              "Try the hands-on exercises",
              "Challenge yourself with the quiz",
              "Explore a real-world application of this concept",
            ],
          },
        },
        estimatedTime: 2,
      };
    }

    if (currentLesson?.knowledgeChecks?.questions?.[0]) {
      const q = currentLesson.knowledgeChecks.questions[0];
      return {
        id: `intervention-${Date.now()}`,
        type: "ADAPTIVE_QUESTION",
        content: {
          question: {
            text: q.question,
            options: q.options.map((opt: string) => ({
              text: opt,
              correct: opt === q.correctAnswer,
              explanation:
                opt === q.correctAnswer
                  ? q.feedback
                  : "Try again! Review the concept and give it another shot.",
            })),
            difficulty: "medium",
          },
        },
        estimatedTime: 2,
      };
    }

    return {
      id: `intervention-${Date.now()}`,
      type: "ENCOURAGEMENT",
      content: {
        encouragement: {
          message: "You're doing great! Keep up the excellent work.",
          actionItems: [
            "Continue to the next section",
            "Review key concepts if needed",
          ],
        },
      },
      estimatedTime: 1,
    };
  };

  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Network error during logout:", error);
    }
  };

  const retryLoadLessons = () => {
    if (currentModule) {
      setLessonErrors((prev) => ({
        ...prev,
        [currentModule.moduleNumber]: "",
      }));
      loadingModulesRef.current.delete(currentModule.moduleNumber);
      loadModuleLessons(currentModule);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

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

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <AutoMoodTrigger
                  enrollmentId={enrollmentId}
                  courseModuleId={currentModule?.id}
                  lessonModuleId={filteredLessons[0]?.id}
                  onMoodDetected={(moodResponse) => {
                    setDetectedMood(moodResponse);

                    if (moodResponse.intervention) {
                      const intervention = {
                        id: moodResponse.intervention.id,
                        type: moodResponse.intervention.interventionType,
                        content: {
                          question: moodResponse.intervention.adaptiveQuestion,
                          encouragement: moodResponse.intervention.encouragement
                            ? {
                                message:
                                  moodResponse.intervention.encouragement,
                                actionItems: [],
                              }
                            : undefined,
                          hint: moodResponse.intervention.hint
                            ? {
                                level: "moderate",
                                text: moodResponse.intervention.hint,
                                relatedConcepts: [],
                              }
                            : undefined,
                          simplification:
                            moodResponse.intervention.simplification,
                        },
                        estimatedTime: 2,
                      };

                      setShowMoodPanel(true);
                    }
                  }}
                  triggerInterval={1}
                />
              </div>
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

          <nav className="flex-1 overflow-y-auto p-6 space-y-2 justify-between">
            {modules.map((mod: any, idx: number) => {
              const isLoading = loadingLessons[mod.moduleNumber];
              const hasError = lessonErrors[mod.moduleNumber];

              return (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  disabled={isLoading}
                  className={cn(
                    "w-full text-left flex items-center gap-4 p-3 rounded-xl border-2 transition-all relative",
                    idx === currentPage
                      ? "bg-amber-500 dark:bg-amber-600 text-black border-amber-400 shadow-lg font-bold"
                      : "text-gray-400 hover:text-white border-transparent hover:bg-gray-800",
                    isLoading && "opacity-50 cursor-not-allowed",
                    hasError && "border-red-500/50",
                  )}
                >
                  <span className="font-mono text-[10px]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest flex-1">
                    {mod.moduleName}
                  </span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {hasError && !isLoading && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 flex justify-between border-t-2 border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            >
              <BookDashed size={18} />
              DashBoard
            </button>
          </div>
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

                {isLoadingCurrentModule && (
                  <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Loading Module Content
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Preparing lessons for {currentModule?.moduleName}...
                    </p>
                  </div>
                )}

                {currentModuleError && !isLoadingCurrentModule && (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Failed to Load Lessons
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                      {currentModuleError}
                    </p>
                    <button
                      onClick={retryLoadLessons}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!isLoadingCurrentModule && !currentModuleError && (
                  <div className="space-y-12">
                    <div className="text-amber-600 font-mono text-[11px] font-black uppercase tracking-[0.3em]">
                      Section {currentModule?.moduleNumber}
                    </div>
                    <h1 className="text-5xl md:text-8xl font-serif font-bold leading-[1.05] text-gray-900 dark:text-gray-100">
                      {currentModule?.moduleName}
                    </h1>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border-l-[6px] border-amber-500 p-10 rounded-r-3xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-8 flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        Key Objectives
                      </h4>
                      {currentModule?.learningObjectives?.map(
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
                      currentLessons?.[moduleNumber]
                        ?.differentiatedLearning && (
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
                      {filteredLessons.length > 0 ? (
                        filteredLessons.map(
                          (lesson: any, lessonIndex: number) => {
                            const lessonId = lesson.id;

                            if (!lessonId) {
                              console.error(
                                "❌ Missing lesson.id for:",
                                lesson.title,
                              );
                              return null;
                            }

                            return (
                              <LessonSection
                                key={lessonIndex}
                                lesson={lesson}
                                lessonIndex={lessonIndex}
                                enrollmentId={enrollmentId || ""}
                                showAnswers={showAnswers}
                                setShowAnswers={setShowAnswers}
                                moduleResources={currentModule?.resources}
                                exitCriteria={
                                  currentModule?.masteryRequirements
                                }
                                spacedRepition={
                                  currentModule?.weeklyLearningPlan
                                }
                                userId={user?.userId}
                                currentModule={currentModule}
                                lessonModuleId={lessonId}
                              />
                            );
                          },
                        )
                      ) : (
                        <div className="text-center py-16">
                          <p className="text-gray-500 dark:text-gray-400">
                            No lessons available yet for this module.
                          </p>
                        </div>
                      )}

                      {data && (
                        <div className="mt-24 pt-24 border-t-4 border-double border-amber-200 dark:border-amber-900/30">
                          <CapstoneProject data={data} />
                        </div>
                      )}
                    </article>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="fixed bottom-10 right-10 flex gap-4 z-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-4 bg-white dark:bg-gray-900 border-2 border-gray-300 rounded-full shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-5 bg-gray-900 dark:bg-amber-600 text-white rounded-full shadow-2xl scale-110 border-2 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-115 transition-transform"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </main>
      </div>

      <div className="fixed bottom-24 right-6 z-[60]">
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
                ? {
                    message: detectedMood.intervention.encouragement,
                    actionItems: [],
                  }
                : undefined,
              hint: detectedMood.intervention.hint
                ? {
                    level: "moderate",
                    text: detectedMood.intervention.hint,
                    relatedConcepts: [],
                  }
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
  const { isComplete, toggleComplete } = useLessonProgress(
    lessonId,
    lesson.day,
  );
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
          {
            method: "GET",
            credentials: "include",
          },
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
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      setTimeSpent(elapsedMinutes);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      !lessonEndRef.current ||
      hasAutoCompletedRef.current ||
      isCheckingCompletion
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            console.log("🎯 Reached bottom of lesson - auto-completing...");
            hasAutoCompletedRef.current = true;
            handleCompleteLesson(true);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "0px 0px -100px 0px",
      },
    );

    observer.observe(lessonEndRef.current);

    return () => observer.disconnect();
  }, [enrollmentId, lessonModuleId, hasMarkedComplete, isCheckingCompletion]);

  const handleReplayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(
      lesson.coreContent?.concepts
        ?.map((c: any) => c.narrativeExplanation)
        .join(" ") || "",
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
    const finalTimeSpent = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 60000),
    );

    if (!enrollmentId) {
      if (!isAutoComplete) toast.error("Missing enrollment information");
      return;
    }

    if (!lessonModuleId) {
      if (!isAutoComplete) toast.error("Missing lesson module ID");
      return;
    }

    if (hasMarkedComplete) {
      if (!isAutoComplete) {
        toast("This lesson is already completed", { icon: "✅" });
      }
      return;
    }

    try {
      console.log("📤 Calling completeLesson API...");

      await completeLesson({
        enrollmentId,
        lessonModuleId,
        timeSpentMinutes: finalTimeSpent,
        exercisesCompleted: 0,
        totalExercises: 0,
      });

      console.log("✅ Lesson marked complete");

      setHasMarkedComplete(true);
      hasAutoCompletedRef.current = true;

      if (!isComplete) {
        toggleComplete();
      }

      window.dispatchEvent(new CustomEvent("progressUpdated"));
    } catch (error) {
      console.error("❌ Failed to complete lesson:", error);
      hasAutoCompletedRef.current = false;
    }
  };

  return (
    <>
      <div className="mb-40 last:mb-0">
        <div className="flex items-center gap-8 mb-16 pb-8 border-b-4 border-double border-slate-200 dark:border-slate-800">
          <div className="shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg mb-2">
              <span className="font-serif italic text-white text-2xl font-bold">
                {lesson.day}
              </span>
            </div>
            <span className="block text-center text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
              Chapter
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
              {lesson.title}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-amber-500" />
                {lesson.duration}
              </span>
              {(isComplete || hasMarkedComplete) && (
                <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Award
                    size={14}
                    className="text-emerald-600 dark:text-emerald-500"
                  />
                  Completed
                </span>
              )}
              {timeSpent > 0 && (
                <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg">
                  <Clock
                    size={14}
                    className="text-blue-600 dark:text-blue-500"
                  />
                  {timeSpent} min
                </span>
              )}
            </div>
          </div>

          <button
            onClick={toggleComplete}
            className={cn(
              "shrink-0 p-4 rounded-2xl transition-all border-2 shadow-md hover:shadow-lg",
              isComplete || hasMarkedComplete
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 border-emerald-300 dark:border-emerald-800"
                : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700",
            )}
            title={isComplete ? "Mark as incomplete" : "Mark as complete"}
          >
            <Award size={28} />
          </button>
        </div>

        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <PreLessonCheck
            checks={lesson.learningObjectives.map((obj: any) => obj.objective)}
          />
        )}

        {spacedRepition && <SpacedRepetition data={spacedRepition} />}

        <div className="space-y-32">
          {lesson.coreContent?.concepts?.map((concept: any, idx: number) => {
            const isLastConcept =
              idx === lesson.coreContent.concepts.length - 1;

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
          <div className="my-32">
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

        <div className="mt-32 pt-16 border-t-4 border-double border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleOpenVideoTutor}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-amber-500/50 flex items-center gap-3"
            >
              <Play size={20} />
              Generate AI Video Lecture
            </button>

            {enrollmentId && (
              <button
                onClick={() => handleCompleteLesson(false)}
                disabled={completing || hasMarkedComplete}
                className={cn(
                  "px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg",
                  completing || hasMarkedComplete
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/50",
                )}
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Saving Progress...
                  </>
                ) : hasMarkedComplete ? (
                  <>
                    <Award className="w-5 h-5 inline mr-2" />
                    Lesson Complete ✓
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5 inline mr-2" />
                    Mark Lesson as Complete
                  </>
                )}
              </button>
            )}
          </div>

          {timeSpent > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                You've spent{" "}
                <strong>
                  {timeSpent} minute{timeSpent !== 1 ? "s" : ""}
                </strong>{" "}
                on this lesson
              </p>
            </div>
          )}

          <div
            ref={lessonEndRef}
            className="h-1 w-full mt-16"
            aria-hidden="true"
          />
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
