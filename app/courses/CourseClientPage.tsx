"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import CourseBookUI from "@/app/components/book";
import type { LessonsData, DailyLesson } from "@/app/constants/utils";

const transformLessonsToUIFormat = (
  dbLessons: any[],
  moduleNumber: number,
  moduleName: string,
  additionalData?: any,
): LessonsData => {
  const dailyLessons: DailyLesson[] = dbLessons.map((lesson) => ({
    day: lesson.day,
    title: lesson.title,
    duration: lesson.duration,
    learningObjectives: lesson.learningObjectives || [],
    coreContent: lesson.coreContent || {},
    handsOnPractice: lesson.handsOnPractice || {},
    knowledgeChecks: lesson.knowledgeChecks || {},
    commonPitfalls: lesson.commonPitfalls || [],
    practicalApplication: lesson.practicalApplication,
    resources: lesson.resources,
    spacedRepetition: lesson.spacedRepetition,
    exitCriteria: lesson.exitCriteria,
  }));

  const totalMinutes = dbLessons.reduce((sum, lesson) => {
    const durationMatch = lesson.duration?.match(/(\d+)/);
    return sum + (durationMatch ? parseInt(durationMatch[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalDuration = `${totalHours}h ${remainingMinutes}m`;

  const lessonsData: LessonsData = {
    moduleTitle: moduleName,
    moduleNumber: moduleNumber,
    totalDuration: totalDuration,
    dailyLessons: dailyLessons,

    [moduleNumber]: {
      dailyLessons: dailyLessons,
      weeklyMilestones: additionalData?.weeklyMilestones || [],
      differentiatedLearning: additionalData?.differentiatedLearning || {},
      assessmentBlueprint: additionalData?.assessmentBlueprint || {},
    },
  };

  return lessonsData;
};

const CourseClientPage = ({ id }: { id: string }) => {
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Record<number, LessonsData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingModule, setGeneratingModule] = useState<number | null>(null);

  const processingModules = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch course");

        const result = await response.json();
        const courseData = result.data;
        

        const generatedModules = courseData.generationParams.modules || [];
        const dbModules = courseData.modules || [];

        const enrichedModules = generatedModules.map((genModule: any) => {
          const dbModule = dbModules.find(
            (m: any) => m.moduleNumber === genModule.moduleNumber,
          );

          if (!dbModule) {
            console.warn(
              `No database module found for moduleNumber ${genModule.moduleNumber}`,
            );
          }

          return {
            ...genModule,
            id: dbModule?.id,
            resources: dbModule?.resources ?? genModule.resources,
          };
        });

        setCourse(enrichedModules);

        setMetadata({
          level: courseData.level,
          subject: courseData.subject,
          goals: courseData.goals,
          style: "Hands-on",
          time: "2 hours/week",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  const fetchModuleContent = useCallback(
    async (moduleToFetch: any) => {
      const modNum = moduleToFetch.moduleNumber;

      if (!metadata) {
        console.log("⏸️ Metadata not loaded yet");
        return;
      }

      if (lessons[modNum]) {
        
        return;
      }

      if (processingModules.current.has(modNum)) {
        console.log(`⏳ Module ${modNum} is already being processed`);
        return;
      }

      if (isGenerating) {
        console.log(
          `⏳ Currently generating module ${generatingModule}, please wait...`,
        );
        return;
      }

      if (!moduleToFetch.id) {
        console.error(`❌ Module ${modNum} has no database ID`);
        return;
      }

      processingModules.current.add(modNum);
      setIsGenerating(true);
      setGeneratingModule(modNum);

      try {
        const checkResponse = await fetch(
          `/api/courses/lesson?courseModuleId=${moduleToFetch.id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();

          if (checkResult?.success && checkResult.lessons?.length > 0) {
            console.log(
              `✅ Found ${checkResult.lessons.length} cached lessons for Module ${modNum} in database`,
            );

            const additionalData = {
              weeklyMilestones: checkResult.moduleData?.weeklyMilestones || [],
              differentiatedLearning:
                checkResult.moduleData?.lessonData?.differentiatedLearning ||
                {},
              assessmentBlueprint:
                checkResult.moduleData?.assessmentBlueprint || {},
            };

            const transformedLessons = transformLessonsToUIFormat(
              checkResult.lessons,
              modNum,
              moduleToFetch.moduleName,
              additionalData,
            );

            setLessons((prev) => ({
              ...prev,
              [modNum]: transformedLessons,
            }));

            return; // Early return - don't generate
          } else {
            console.log(`📭 No lessons found in database for Module ${modNum}`);
          }
        } else {
          console.log(
            `⚠️ Database check failed with status ${checkResponse.status}`,
          );
        }

        

        // Step 2: Generate new lessons with AI
        const generateResponse = await fetch("/api/ai/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            course: {
              ...moduleToFetch,
              userLevel: metadata.level,
              learningStyle: metadata.style,
              availableTime: metadata.time,
              subject: metadata.subject,
            },
          }),
        });

        if (!generateResponse.ok) {
          const errorText = await generateResponse.text();
          console.error("❌ AI generation failed:", errorText);
          throw new Error(`AI generation failed: ${generateResponse.status}`);
        }

        const generateResult = await generateResponse.json();

        if (!generateResult?.success || !generateResult.lessons) {
          throw new Error(
            generateResult?.error || "Failed to generate lessons",
          );
        }

     

        // Step 3: Extract lesson data
        const moduleKey = String(modNum);
        let aiLessonsData;

        if (generateResult.lessons[moduleKey]) {
          aiLessonsData = generateResult.lessons[moduleKey];
          console.log(`📚 Extracted lessons from module key ${moduleKey}`);
        } else if (generateResult.lessons.dailyLessons) {
          aiLessonsData = generateResult.lessons;
          console.log(`📚 Using direct lessons object`);
        } else {
          console.error(
            "❌ Unexpected AI response structure:",
            generateResult.lessons,
          );
          throw new Error("Unexpected lesson data structure from AI");
        }

        const dailyLessons = aiLessonsData.dailyLessons || [];

        if (!dailyLessons || dailyLessons.length === 0) {
          throw new Error("No daily lessons found in AI response");
        }

        console.log(`💾 Saving ${dailyLessons.length} lessons to database...`);

        // Step 4: Save to database
        const saveResponse = await fetch("/api/courses/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            courseModuleId: moduleToFetch.id,
            lessons: dailyLessons,
          }),
        });

        const saveText = await saveResponse.text();

        let saveResult;
        try {
          saveResult = JSON.parse(saveText);
        } catch (parseError) {
          throw new Error("Invalid response from save endpoint");
        }

        if (saveResult?.success) {
          // Prepare additional data from AI response
          const additionalData = {
            weeklyMilestones: aiLessonsData.weeklyMilestones || [],
            differentiatedLearning: aiLessonsData.differentiatedLearning || {},
            assessmentBlueprint: aiLessonsData.assessmentBlueprint || {},
          };

          // Transform saved lessons with additional data
          const transformedLessons = transformLessonsToUIFormat(
            saveResult.lessons,
            modNum,
            moduleToFetch.moduleName,
            additionalData,
          );

          setLessons((prev) => ({
            ...prev,
            [modNum]: transformedLessons,
          }));
        } else {
          console.error("❌ Save failed:", saveResult);

          
          const fullLessonsData: LessonsData = {
            moduleTitle: aiLessonsData.moduleTitle || moduleToFetch.moduleName,
            moduleNumber: modNum,
            totalDuration: aiLessonsData.totalDuration || "Unknown",
            dailyLessons: dailyLessons,
            assessmentBlueprint: aiLessonsData.assessmentBlueprint,
            differentiatedLearning: aiLessonsData.differentiatedLearning,
            weeklyMilestones: aiLessonsData.weeklyMilestones,
            [modNum]: {
              dailyLessons: dailyLessons,
              differentiatedLearning: aiLessonsData.differentiatedLearning,
              weeklyMilestones: aiLessonsData.weeklyMilestones,
              assessmentBlueprint: aiLessonsData.assessmentBlueprint,
            },
          };

          setLessons((prev) => ({
            ...prev,
            [modNum]: fullLessonsData,
          }));

          throw new Error(saveResult.message || "Failed to save lessons");
        }

        console.log(`🎉 Successfully processed lessons for Module ${modNum}`);
      } catch (error) {
        console.error(
          `❌ Error processing lessons for module ${modNum}:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate lessons";

        alert(
          `Module ${modNum}: ${errorMessage}\n\nPlease try again in a moment.`,
        );
      } finally {
        processingModules.current.delete(modNum);
        setIsGenerating(false);
        setGeneratingModule(null);
      }
    },
    [lessons, metadata, isGenerating, generatingModule],
  );

  const handleReset = () => {
    window.location.href = "/generate";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-slate-600">{error || "Course not found"}</p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
          >
            Back to Generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CourseBookUI
        course={course}
        lessons={lessons}
        onModuleSelect={(mod: any) => fetchModuleContent(mod)}
        onReset={handleReset}
      />

      {isGenerating && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 max-w-md">
          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="font-bold">Module {generatingModule}</p>
            <p className="text-xs text-amber-100">
              Checking cache, then generating if needed...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseClientPage;
