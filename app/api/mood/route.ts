import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import {
  verifyToken,
  createErrorResponse,
  createSuccessResponse,
} from "../lib/auth/auth";
import { generateMoodIntervention } from "../ai/gemini/gemini"; 
import { Prisma, InterventionType, MoodType } from "@prisma/client";


async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const {
      enrollmentId,
      lessonModuleId,
      courseModuleId,
      mood,
      intensity,
      trigger,
      context,
      actionTaken,
      wasHelpful,
      metadata,
    } = body;

    // Create mood entry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: user.userId,
        enrollmentId,
        lessonModuleId,
        courseModuleId,
        mood,
        intensity,
        trigger,
        context,
        actionTaken,
        wasHelpful,
        metadata,
      },
    });

    // ✨ NEW: Check if intervention is needed
    const shouldIntervene = checkInterventionNeeded(mood, intensity);

    let intervention = null;

    if (shouldIntervene && lessonModuleId) {
      // Fetch lesson content for context
      const lessonModule = await prisma.lessonModule.findUnique({
        where: { id: lessonModuleId },
        select: {
          title: true,
          learningObjectives: true,
          coreContent: true,
          duration: true,
        },
      });

      // Fetch learner context
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          moduleProgress: {
            orderBy: { updatedAt: "desc" },
            take: 3,
          },
        },
      });

      const learnerContext = {
        recentPerformance: enrollment?.averageMasteryScore || 0,
        strugglingConcepts: [], // TODO: Extract from past quiz failures
        learningStyle: enrollment?.learningStyle || "visual",
      };

      // Generate AI intervention
      const startTime = Date.now();
      const aiResponse = await generateMoodIntervention({
        mood,
        intensity,
        lessonContent: lessonModule,
        learnerContext,
      });
      const generationTime = Date.now() - startTime;

      
      intervention = await prisma.moodIntervention.create({
        data: {
          moodEntryId: moodEntry.id,
          userId: user.userId,
          enrollmentId,
          lessonModuleId,
          triggerMood: mood,
          triggerIntensity: intensity,
          interventionType: InterventionType[aiResponse.type as keyof typeof InterventionType],
          adaptiveQuestion:
            aiResponse.content.question || ({} as Prisma.JsonObject),
          encouragement: aiResponse.content.encouragement?.message,
          simplification:
            aiResponse.content.simplification || ({} as Prisma.JsonObject),
          hint: aiResponse.content.hint?.text,
          generationTime,
        },
      });
    }

    return createSuccessResponse(
      {
        moodEntry,
        intervention, 
      },
      201
    );
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return createErrorResponse("Failed to create mood entry", 500);
  }
}

function checkInterventionNeeded(mood: string, intensity: number): boolean {
  

  const negativeMoods = ["FRUSTRATED", "CONFUSED", "OVERWHELMED"];
  if (negativeMoods.includes(mood) && intensity >= 3) {
    return true;
  }

  if (mood === "BORED" && intensity >= 3) {
    return true;
  }

  
  if (mood === "NEUTRAL" && intensity <= 2) {
    return true;
  }

  return false;
}