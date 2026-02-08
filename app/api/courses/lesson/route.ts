import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";
import { Prisma } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

interface CreateLessonBody {
  courseModuleId: string;
  lessons: any[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseModuleId = searchParams.get("courseModuleId");

    if (!courseModuleId) {
      return NextResponse.json(
        { success: false, message: "courseModuleId required" },
        { status: 400 }
      );
    }

    console.log("Fetching lessons for module:", courseModuleId);

    const lessons = await prisma.lessonModule.findMany({
      where: { courseModuleId },
      orderBy: { order: "asc" },
    });

    const module = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      select: {
        id: true,
        weeklyLearningPlan: true,
        masteryVerification: true,
        assessmentMethods: true,
        resources: true,
        learningObjectives: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    const moduleData = {
      weeklySchedule: module.weeklyLearningPlan,
      differentiatedLearning: module.masteryVerification,
      assessmentBlueprint: module.assessmentMethods,
      resources: module.resources,
      learningObjectives: module.learningObjectives,
    };

    console.log(`Found ${lessons.length} lessons and module data`);

    return NextResponse.json({
      success: true,
      lessons,
      moduleData,
      moduleId: courseModuleId,
      count: lessons.length,
    });
  } catch (error) {
    console.error("Fetch lessons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/courses/lesson called");

    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      console.log("No auth token found");
      return NextResponse.json(
        { success: false, message: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    let payload: JwtPayload;
    try {
      payload = verifyToken(token) as JwtPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!payload?.userId) {
      console.log("No userId in token payload");
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", payload.userId);

    const body = (await req.json()) as CreateLessonBody;
    console.log("Request body:", {
      courseModuleId: body.courseModuleId,
      lessonsCount: body.lessons?.length,
    });

    const { courseModuleId, lessons } = body;

    if (!courseModuleId) {
      console.log("Missing courseModuleId");
      return NextResponse.json(
        { success: false, message: "Missing courseModuleId" },
        { status: 400 }
      );
    }

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      console.log("Invalid lessons array");
      return NextResponse.json(
        { success: false, message: "Invalid or empty lessons array" },
        { status: 400 }
      );
    }

    console.log(`Creating ${lessons.length} lessons for module ${courseModuleId}`);

    const module = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      include: {
        course: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });

    if (!module) {
      console.log("Module not found:", courseModuleId);
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    if (module.course.creatorId !== payload.userId) {
      console.log("User doesn't own this course");
      return NextResponse.json(
        { success: false, message: "Unauthorized - not course owner" },
        { status: 403 }
      );
    }

    const existingLessons = await prisma.lessonModule.findMany({
      where: { courseModuleId },
      select: { id: true },
    });

    if (existingLessons.length > 0) {
      console.log("Lessons already exist for this module");
      const fetchedLessons = await prisma.lessonModule.findMany({
        where: { courseModuleId },
        orderBy: { order: "asc" },
      });

      return NextResponse.json({
        success: true,
        lessons: fetchedLessons,
        moduleId: courseModuleId,
        count: fetchedLessons.length,
        message: "Lessons already exist",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const lessonsData = lessons.map((lesson: any, index: number) => ({
          courseModuleId,
          day: lesson.day || index + 1,
          title: lesson.title || `Day ${index + 1}`,
          duration: lesson.duration || "60 minutes",
          learningObjectives: lesson.learningObjectives || [],
          coreContent: lesson.coreContent || {},
          handsOnPractice: lesson.handsOnPractice || {},
          knowledgeChecks: lesson.knowledgeChecks || [],
          practicalApplication: lesson.practicalApplication || null,
          commonPitfalls: lesson.commonPitfalls || {},
          resources: lesson.resources || null,
          spacedRepetition: lesson.spacedRepetition || null,
          exitCriteria: lesson.exitCriteria || null,
          order: index + 1,
        }));

        console.log("Prepared lessons data:", lessonsData.length);

        await tx.lessonModule.createMany({
          data: lessonsData,
        });

        const createdLessons = await tx.lessonModule.findMany({
          where: { courseModuleId },
          orderBy: { order: "asc" },
        });

        console.log(`Successfully created ${createdLessons.length} lessons`);

        const updatedModuleProgress = await tx.moduleProgress.updateMany({
          where: { courseModuleId },
          data: { totalLessons: createdLessons.length },
        });

        console.log(`Updated ${updatedModuleProgress.count} module progress records`);

        const enrollments = await tx.enrollment.findMany({
          where: { courseId: module.course.id },
          select: { id: true, userId: true },
        });

        console.log(`Found ${enrollments.length} enrollments for this course`);

        if (enrollments.length > 0) {
          const lessonProgressData = enrollments.flatMap((enrollment) =>
            createdLessons.map((lesson) => ({
              enrollmentId: enrollment.id,
              lessonModuleId: lesson.id,
              status: "NOT_STARTED" as const,
              timeSpentMinutes: 0,
              exercisesCompleted: 0,
              totalExercises: 0,
            }))
          );

          const createdProgress = await tx.lessonProgress.createMany({
            data: lessonProgressData,
          });

          console.log(
            `Created ${createdProgress.count} lesson progress records ` +
            `(${enrollments.length} enrollments × ${createdLessons.length} lessons)`
          );
        }

        return createdLessons;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    return NextResponse.json({
      success: true,
      lessons: result,
      moduleId: courseModuleId,
      count: result.length,
      message: "Lessons created successfully",
    });
  } catch (error) {
    console.error("Create lesson error:", error);

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
        message: "Failed to create lessons",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}