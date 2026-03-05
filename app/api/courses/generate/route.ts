import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";
import { CourseLevel, Prisma } from "@prisma/client";
import crypto from "crypto";

interface CreateCourseBody {
  title: string;
  description?: string;
  subject: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  goals: string;
  generationParams: {
    modules: Array<{
      moduleNumber: number;
      moduleName: string;
      learningObjectives?: any[];
      masteryRequirements?: any;
      assessmentMethods?: any[];
      weeklyLearningPlan?: any;
      resources?: any;
      masteryVerification?: any;
    }>;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token) as JwtPayload;
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = (await req.json()) as CreateCourseBody;
    const { title, description, subject, level, goals, generationParams } = body;

    if (!title || !subject || !level || !goals || !generationParams) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(generationParams.modules) ||
      generationParams.modules.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "At least one module is required" },
        { status: 400 }
      );
    }


    const levelMap: Record<string, CourseLevel> = {
      Beginner: CourseLevel.BEGINNER,
      Intermediate: CourseLevel.INTERMEDIATE,
      Advanced: CourseLevel.INTERMEDIATE,
    };
    const prismaLevel = levelMap[level];

    if (!prismaLevel) {
      return NextResponse.json(
        { success: false, message: "Invalid course level" },
        { status: 400 }
      );
    }

    // Check for duplicate course
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${subject}:${level}:${goals}`)
      .digest("hex");

    const existing = await prisma.course.findUnique({
      where: { fingerprint },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Duplicate course detected", courseId: existing.id },
        { status: 409 }
      );
    }

    // --- FLASHCARD POLISH: Pre-parse objectives using Gemini ---
    const rawObjectives: { moduleNumber: number, text: string }[] = [];
    generationParams.modules.forEach((mod: any) => {
      const concepts = Array.isArray(mod.learningObjectives) && mod.learningObjectives.length > 0
        ? mod.learningObjectives
        : [`Concept from Module ${mod.moduleNumber}`];
      concepts.forEach((c: any) => {
        rawObjectives.push({
          moduleNumber: mod.moduleNumber,
          text: typeof c === 'string' ? c : JSON.stringify(c)
        });
      });
    });

    let parsedFlashcards: any[] = [];
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { responseMimeType: "application/json" }
      });
      const prompt = `Convert the following learning objectives into flashcards. Return a valid JSON array of objects. Schema: [{"moduleNumber": number, "term": "string", "def": "string", "analogy": "string"}]. Objectives: ${JSON.stringify(rawObjectives)}`;
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      parsedFlashcards = JSON.parse(textResponse);
    } catch (err) {
      console.error("Gemini flashcard parsing error:", err);
      // Fallback
      parsedFlashcards = rawObjectives.map(o => ({
        moduleNumber: o.moduleNumber,
        term: o.text.length > 50 ? o.text.substring(0, 50) + "..." : o.text,
        def: o.text,
        analogy: "Think of this in the context of the module."
      }));
    }
    // -----------------------------------------------------------

    // Create course with all related data in a transaction
    const course = await prisma.$transaction(
      async (tx) => {
        // Create course and modules
        const newCourse = await tx.course.create({
          data: {
            creatorId: payload.userId,
            fingerprint,
            title,
            description: description || null,
            subject,
            level: prismaLevel,
            goals,
            generationParams,
            totalEnrollments: 1,
            modules: {
              create: generationParams.modules.map((module, index) => ({
                moduleNumber: module.moduleNumber,
                moduleName: module.moduleName,
                learningObjectives: module.learningObjectives || [],
                masteryRequirements: module.masteryRequirements || {},
                assessmentMethods: module.assessmentMethods || [],
                weeklyLearningPlan: module.weeklyLearningPlan || {},
                resources: module.resources || {},
                masteryVerification: module.masteryVerification || {},
                estimatedHours: module.weeklyLearningPlan?.totalHours || null,
                order: index + 1,
              })),
            },
          },
          include: {
            modules: {
              orderBy: { order: "asc" },
            },
          },
        });

        // Create enrollment for the course creator
        const enrollment = await tx.enrollment.create({
          data: {
            userId: payload.userId,
            courseId: newCourse.id,
            availableTime: '',
            learningStyle: '',
            deadline: '',
            status: "ACTIVE",
            currentModuleNumber: 1,
            currentDay: 1,
            overallCompletion: 0,
            averageMasteryScore: 0,
            totalTimeSpent: 0,
          },
        });

        // Create module progress for each module
        await tx.moduleProgress.createMany({
          data: newCourse.modules.map((module) => ({
            enrollmentId: enrollment.id,
            userId: payload.userId,
            courseModuleId: module.id,
            status: module.moduleNumber === 1 ? "IN_PROGRESS" : "LOCKED",
            lessonsCompleted: 0,
            totalLessons: 0,
            masteryScore: 0,
            timeSpentMinutes: 0,
          })),
        });

        // --- PILLAR 1: AI AUTO-DECK GENERATION ---
        const reviewItemsToCreate: any[] = [];
        const today = new Date();

        parsedFlashcards.forEach((fc: any) => {
          // Serialize to valid JSON, keeping lengths in check just in case
          const safeJson = JSON.stringify({
            term: (fc.term || "Concept").substring(0, 100),
            def: (fc.def || "Definition waiting").substring(0, 300),
            analogy: (fc.analogy || "").substring(0, 200)
          });

          reviewItemsToCreate.push({
            enrollmentId: enrollment.id,
            moduleNumber: fc.moduleNumber || 1,
            conceptId: safeJson,
            dueDate: today,       // Due immediately to start the habit loop
            repetitionCount: 0,
            easinessFactor: 2.5,
            interval: 1,
            completed: false
          });
        });

        if (reviewItemsToCreate.length > 0) {
          await tx.reviewItem.createMany({
            data: reviewItemsToCreate
          });
        }
        // -----------------------------------------

        // Log enrollment activity
        await tx.userActivity.create({
          data: {
            userId: payload.userId,
            enrollmentId: enrollment.id,
            activityType: "COURSE_ENROLLED",
            metadata: {
              courseId: newCourse.id,
              courseTitle: newCourse.title,
            },
          },
        });

        return newCourse;
      },
      {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      }
    );

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Create course error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          success: false,
          message: "Database error",
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create course",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}