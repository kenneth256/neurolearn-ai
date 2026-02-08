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

    // Map level to Prisma enum
    const levelMap: Record<string, CourseLevel> = {
      Beginner: CourseLevel.BEGINNER,
      Intermediate: CourseLevel.INTERMEDIATE,
      Advanced: CourseLevel.ADVANCED,
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