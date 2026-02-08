import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get("enrollmentId");
    const lessonModuleId = searchParams.get("lessonModuleId");

    if (!enrollmentId || !lessonModuleId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { userId: true },
    });

    if (!enrollment || enrollment.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonModuleId: {
          enrollmentId,
          lessonModuleId,
        },
      },
      select: {
        id: true,
        status: true,
        timeSpentMinutes: true,
        quizScore: true,
        exercisesCompleted: true,
        totalExercises: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      lessonProgress,
    });
  } catch (error) {
    console.error("Get lesson progress error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get lesson progress",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}