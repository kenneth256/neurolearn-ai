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

    console.log('📥 Mood API called:', { mood, intensity, lessonModuleId });

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

    console.log('✅ Mood entry created:', moodEntry.id);

    const shouldIntervene = checkInterventionNeeded(mood, intensity);
    console.log('🔍 Should intervene?', shouldIntervene, 'lessonModuleId:', lessonModuleId);

    let intervention = null;

    if (shouldIntervene && lessonModuleId) {
      console.log('🎯 Generating intervention...');
      
      const lessonModule = await prisma.lessonModule.findUnique({
        where: { id: lessonModuleId },
        select: {
          title: true,
          learningObjectives: true,
          coreContent: true,
          duration: true,
        },
      });

      console.log('📚 Lesson found:', lessonModule?.title);

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
        strugglingConcepts: [],
        learningStyle: enrollment?.learningStyle || "visual",
      };

      const startTime = Date.now();
      let aiResponse;
      
      try {
        aiResponse = await generateMoodIntervention({
          mood,
          intensity,
          lessonContent: lessonModule,
          learnerContext,
        });
        
        console.log('🤖 AI response:', aiResponse.type);
      } catch (aiError) {
        console.error('❌ AI intervention failed, using fallback:', aiError);
        aiResponse = generateFallbackIntervention(mood, intensity);
        console.log('🔄 Using fallback intervention:', aiResponse.type);
      }
      
      const generationTime = Date.now() - startTime;

      try {
        intervention = await prisma.moodIntervention.create({
          data: {
            moodEntryId: moodEntry.id,
            userId: user.userId,
            enrollmentId,
            lessonModuleId,
            triggerMood: mood,
            triggerIntensity: intensity,
            interventionType: InterventionType[aiResponse.type as keyof typeof InterventionType],
            adaptiveQuestion: ('question' in aiResponse.content && aiResponse.content.question) ? aiResponse.content.question : undefined,
            encouragement: ('encouragement' in aiResponse.content) ? aiResponse.content.encouragement?.message : undefined,
            simplification: ('simplification' in aiResponse.content && aiResponse.content.simplification) ? aiResponse.content.simplification : undefined,
            hint: ('hint' in aiResponse.content) ? aiResponse.content.hint?.text : undefined,
            generationTime,
          },
        });
        
        console.log('✅ Intervention created:', intervention.id);
      } catch (dbError) {
        console.error('❌ Failed to save intervention to database:', dbError);
      }
    } else {
      console.log('⏭️ Skipping intervention - shouldIntervene:', shouldIntervene, 'hasLessonId:', !!lessonModuleId);
    }

    console.log('📤 Returning response with intervention:', !!intervention);

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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get("enrollmentId");
    const lessonModuleId = searchParams.get("lessonModuleId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { userId: user.userId };
    if (enrollmentId) where.enrollmentId = enrollmentId;
    if (lessonModuleId) where.lessonModuleId = lessonModuleId;

    const moodEntries = await prisma.moodEntry.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        enrollment: {
          include: {
            course: true,
          },
        },
        lessonModule: true,
        courseModule: true,
        interventions: true,
      },
    });

    return createSuccessResponse(moodEntries, 200);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return createErrorResponse("Failed to fetch mood entries", 500);
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

function generateFallbackIntervention(mood: string, intensity: number) {
  if (mood === "FRUSTRATED" || mood === "OVERWHELMED") {
    return {
      type: "ENCOURAGEMENT",
      content: {
        encouragement: {
          message: "Learning can be challenging, but you're making progress. Take a moment to breathe.",
          actionItems: [
            "Take a 2-minute break",
            "Review the previous section",
            "Try the practice exercises",
            "Ask for help if needed"
          ]
        }
      },
      estimatedTime: 3
    };
  }

  if (mood === "CONFUSED") {
    return {
      type: "HINT",
      content: {
        hint: {
          level: "moderate",
          text: "Break down the concept into smaller parts. Start with understanding the basics before moving to advanced topics.",
          relatedConcepts: ["Review previous lessons", "Check the learning objectives"]
        }
      },
      estimatedTime: 2
    };
  }

  if (mood === "BORED") {
    return {
      type: "ENCOURAGEMENT",
      content: {
        encouragement: {
          message: "Ready for more challenge? Let's make this interesting!",
          actionItems: [
            "Try the advanced exercises",
            "Explore real-world applications",
            "Challenge yourself with the quiz"
          ]
        }
      },
      estimatedTime: 2
    };
  }

  return {
    type: "ENCOURAGEMENT",
    content: {
      encouragement: {
        message: "Keep up the great work! You're on the right track.",
        actionItems: [
          "Continue to the next section",
          "Review what you've learned"
        ]
      }
    },
    estimatedTime: 1
  };
}