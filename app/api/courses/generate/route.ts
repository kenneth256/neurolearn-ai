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
  generationParams: any;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token) as JwtPayload;
    if (!payload?.userId) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = (await req.json()) as CreateCourseBody;
    const { title, description, subject, level, goals, generationParams } = body;

    if (!title || !subject || !level || !goals || !generationParams) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const levelMap: Record<string, CourseLevel> = {
      Beginner: CourseLevel.BEGINNER,
      Intermediate: CourseLevel.INTERMEDIATE,
      Advanced: CourseLevel.ADVANCED,
    };
    const prismaLevel = levelMap[level];

    const fingerprint = crypto.createHash("sha256").update(`${subject}:${level}:${goals}`).digest("hex");
    const existing = await prisma.course.findUnique({ where: { fingerprint }, select: { id: true } });
    if (existing) return NextResponse.json({ success: false, message: "Duplicate course detected" }, { status: 409 });

    const course = await prisma.course.create({
      data: {
        creatorId: payload.userId,
        fingerprint,
        title,
        description,
        subject,
        level: prismaLevel,
        goals,
        generationParams,
        modules: {
          create: generationParams.modules.map((module: any, index: number) => ({
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
        modules: true,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ success: false, message: "Failed to create course" }, { status: 500 });
  }
}