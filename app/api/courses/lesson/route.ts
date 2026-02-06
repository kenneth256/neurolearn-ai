import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";

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
    console.log("GET /api/courses/lesson called");

    const { searchParams } = new URL(req.url);
    const courseModuleId = searchParams.get("courseModuleId");

    if (!courseModuleId) {
      console.log("Missing courseModuleId in query");
      return NextResponse.json(
        { success: false, message: "courseModuleId required" },
        { status: 400 }
      );
    }

    console.log("Fetching lessons for module:", courseModuleId);

    const lessons = await prisma.lessonModule.findMany({
      where: { courseModuleId },
      orderBy: { order: 'asc' }
    });

    const module = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      select: {
        weeklyLearningPlan: true,
        masteryVerification: true,
        assessmentMethods: true,
        resources: true,
        learningObjectives: true,
      }
    });

    const moduleData = module ? {
      weeklySchedule: module.weeklyLearningPlan,
      differentiatedLearning: module.masteryVerification,
      assessmentBlueprint: module.assessmentMethods,
      resources: module.resources,
      learningObjectives: module.learningObjectives,
    } : null;

    console.log(`Found ${lessons.length} lessons and module data`);

    return NextResponse.json({
      success: true,
      lessons,
      moduleData,
      count: lessons.length
    });

  } catch (error) {
    console.error("Fetch lessons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST - Create new lessons
export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/courses/lesson called");

    // Get auth token
    const token = req.cookies.get("auth-token")?.value;
    
    if (!token) {
      console.log("No auth token found");
      return NextResponse.json(
        { success: false, message: "Unauthorized - no token" }, 
        { status: 401 }
      );
    }

    // Verify token
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

    // Parse request body
    const body = (await req.json()) as CreateLessonBody;
    console.log("Request body:", {
      courseModuleId: body.courseModuleId,
      lessonsCount: body.lessons?.length
    });

    const { courseModuleId, lessons } = body;

    // Validate required fields
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

    // Verify module exists and user has access
    const module = await prisma.courseModule.findUnique({
      where: { id: courseModuleId },
      include: {
        course: {
          select: {
            creatorId: true
          }
        }
      }
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

    // Map lessons to LessonModule schema
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

    // Create lessons
    const createdLessons = await prisma.lessonModule.createMany({
      data: lessonsData,
    });

    console.log(`Successfully created ${createdLessons.count} lessons`);

    // Fetch the created lessons to return them
    const fetchedLessons = await prisma.lessonModule.findMany({
      where: { courseModuleId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      lessons: fetchedLessons,
      count: createdLessons.count
    });
    
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create lessons",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}