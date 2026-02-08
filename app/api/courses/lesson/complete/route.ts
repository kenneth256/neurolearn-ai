import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";
import { Prisma } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

interface CompleteLessonBody {
  enrollmentId: string;
  lessonModuleId: string;
  timeSpentMinutes?: number;
  exercisesCompleted?: number;
  totalExercises?: number;
}

export async function POST(req: NextRequest) {
  try {
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

    const body = (await req.json()) as CompleteLessonBody;
    const {
      enrollmentId,
      lessonModuleId,
      timeSpentMinutes = 0,
      exercisesCompleted = 0,
      totalExercises = 0,
    } = body;

    if (!enrollmentId || !lessonModuleId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { userId: true, courseId: true },
    });

    if (!enrollment || enrollment.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get lesson details
    const lesson = await prisma.lessonModule.findUnique({
      where: { id: lessonModuleId },
      select: {
        id: true,
        courseModuleId: true,
        courseModule: {
          select: {
            id: true,
            moduleNumber: true,
            course: {
              select: {
                modules: {
                  orderBy: { order: "asc" },
                  select: { id: true, moduleNumber: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update lesson progress
      const lessonProgress = await tx.lessonProgress.upsert({
        where: {
          enrollmentId_lessonModuleId: {
            enrollmentId,
            lessonModuleId,
          },
        },
        update: {
          status: "COMPLETED",
          timeSpentMinutes: {
            increment: timeSpentMinutes,
          },
          exercisesCompleted,
          totalExercises,
        },
        create: {
          enrollmentId,
          lessonModuleId,
          status: "COMPLETED",
          timeSpentMinutes,
          exercisesCompleted,
          totalExercises,
        },
      });

      // Get all lessons in this module
      const moduleLessons = await tx.lessonModule.findMany({
        where: { courseModuleId: lesson.courseModuleId },
        select: { id: true },
      });

      const moduleLessonIds = moduleLessons.map((l) => l.id);

      // Count completed lessons in this module
      const completedLessonsCount = await tx.lessonProgress.count({
        where: {
          enrollmentId,
          lessonModuleId: {
            in: moduleLessonIds,
          },
          status: "COMPLETED",
        },
      });

      const totalLessons = moduleLessons.length;
      const isModuleComplete = completedLessonsCount === totalLessons && totalLessons > 0;

      // Update module progress
      const moduleProgress = await tx.moduleProgress.upsert({
        where: {
          enrollmentId_courseModuleId: {
            enrollmentId,
            courseModuleId: lesson.courseModuleId,
          },
        },
        update: {
          lessonsCompleted: completedLessonsCount,
          totalLessons,
          status: isModuleComplete
            ? "COMPLETED"
            : completedLessonsCount > 0
            ? "IN_PROGRESS"
            : "LOCKED", 
          timeSpentMinutes: {
            increment: timeSpentMinutes,
          },
        },
        create: {
          enrollmentId,
          userId: payload.userId,
          courseModuleId: lesson.courseModuleId,
          lessonsCompleted: completedLessonsCount,
          totalLessons,
          status: isModuleComplete ? "COMPLETED" : "IN_PROGRESS",
          timeSpentMinutes,
          masteryScore: 0,
        },
      });

      // If module just completed, ensure next module exists in progress
      if (isModuleComplete) {
        const currentModuleNumber = lesson.courseModule.moduleNumber;
        const allModules = lesson.courseModule.course.modules;
        const nextModule = allModules.find(
          (m) => m.moduleNumber === currentModuleNumber + 1
        );

        if (nextModule) {
          // Check if next module progress already exists
          const existingNextModuleProgress = await tx.moduleProgress.findUnique({
            where: {
              enrollmentId_courseModuleId: {
                enrollmentId,
                courseModuleId: nextModule.id,
              },
            },
          });

          // Only create if it doesn't exist
          if (!existingNextModuleProgress) {
            const nextModuleTotalLessons = await tx.lessonModule.count({
              where: { courseModuleId: nextModule.id },
            });

            await tx.moduleProgress.create({
              data: {
                enrollmentId,
                userId: payload.userId,
                courseModuleId: nextModule.id,
                status: "LOCKED",
                lessonsCompleted: 0,
                totalLessons: nextModuleTotalLessons,
                masteryScore: 0,
                timeSpentMinutes: 0,
              },
            });
          }
        }
      }

      // Calculate overall course progress
      const allModuleProgress = await tx.moduleProgress.findMany({
        where: { enrollmentId },
        select: {
          status: true,
          lessonsCompleted: true,
          totalLessons: true,
        },
      });

      const totalCompletedLessons = allModuleProgress.reduce(
        (sum, mp) => sum + mp.lessonsCompleted,
        0
      );
      const totalCourseLessons = allModuleProgress.reduce(
        (sum, mp) => sum + mp.totalLessons,
        0
      );
      const overallCompletion =
        totalCourseLessons > 0
          ? Math.round((totalCompletedLessons / totalCourseLessons) * 100)
          : 0;

      // Update enrollment
      await tx.enrollment.update({
        where: { id: enrollmentId },
        data: {
          overallCompletion,
          totalTimeSpent: {
            increment: timeSpentMinutes,
          },
          currentModuleNumber: lesson.courseModule.moduleNumber,
        },
      });

      // Log activity
      await tx.userActivity.create({
        data: {
          userId: payload.userId,
          enrollmentId,
          activityType: "LESSON_COMPLETED",
          metadata: {
            lessonId: lessonModuleId,
            moduleId: lesson.courseModuleId,
            timeSpent: timeSpentMinutes,
          },
        },
      });

      // If module completed, log that too
      if (isModuleComplete) {
        await tx.userActivity.create({
          data: {
            userId: payload.userId,
            enrollmentId,
            activityType: "MODULE_COMPLETED",
            metadata: {
              moduleId: lesson.courseModuleId,
              moduleNumber: lesson.courseModule.moduleNumber,
            },
          },
        });
      }

      return {
        lessonProgress,
        moduleProgress,
        isModuleComplete,
        overallCompletion,
        completedLessonsCount,
        totalLessons,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isModuleComplete
        ? "Module completed! Next module unlocked."
        : "Lesson completed successfully",
    });
  } catch (error) {
    console.error("Complete lesson error:", error);

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
        message: "Failed to complete lesson",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}