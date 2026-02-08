import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { verifyToken } from "@/app/api/lib/auth/auth";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params;
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payload.userId,
          courseId: courseId,
        },
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        status: true,
        currentModuleNumber: true,
        currentDay: true,
        overallCompletion: true,
        averageMasteryScore: true,
        totalTimeSpent: true,
        enrolledAt: true,
        lastAccessedAt: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Enrollment not found. Please enroll in this course first." 
        },
        { status: 404 }
      );
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get enrollment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}