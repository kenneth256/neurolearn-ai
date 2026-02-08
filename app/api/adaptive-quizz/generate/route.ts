// src/app/api/adaptive-quiz/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { verifyToken, createErrorResponse, createSuccessResponse } from '../../lib/auth/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }
  const decoded = verifyToken(token);
  return decoded;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { enrollmentId, lessonModuleId, courseModuleId } = body;

    const learnerProfile = await prisma.learnerProfile.findUnique({
      where: { userId: user.userId }
    });

    const recentMoods = await prisma.moodEntry.findMany({
      where: {
        userId: user.userId,
        enrollmentId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    const recentAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.userId,
        adaptiveQuiz: { enrollmentId }
      },
      orderBy: { submittedAt: 'desc' },
      take: 3,
      include: {
        adaptiveQuiz: true
      }
    });

    const isBored = recentMoods.some(m => m.mood === 'BORED');
    const averageScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length || 0;

    let difficultyLevel = learnerProfile?.preferredDifficulty || 'MODERATE';
    let adaptationReason = 'regular_assessment';

    if (isBored && averageScore > 80) {
      difficultyLevel = 'CHALLENGING';
      adaptationReason = 'high_performance_bored';
    } else if (averageScore < 60) {
      difficultyLevel = 'EASY';
      adaptationReason = 'low_performance';
    } else if (recentMoods.some(m => m.mood === 'FRUSTRATED')) {
      difficultyLevel = 'MODERATE';
      adaptationReason = 'frustrated_learner';
    }

    const lessonContent = lessonModuleId
      ? await prisma.lessonModule.findUnique({
          where: { id: lessonModuleId },
          select: {
            learningObjectives: true,
            coreContent: true,
            knowledgeChecks: true
          }
        })
      : null;

    const questions = {
      questions: [],
      generatedAt: new Date().toISOString(),
      difficultyLevel,
      adaptationReason,
      basedOn: lessonContent ? 'lesson_content' : 'module_content'
    };

    const adaptiveQuiz = await prisma.adaptiveQuiz.create({
      data: {
        userId: user.userId,
        enrollmentId,
        lessonModuleId,
        courseModuleId,
        difficultyLevel,
        adaptationReason,
        questions,
        totalQuestions: 10,
        estimatedDuration: 15,
        focusAreas: learnerProfile?.commonStruggles || [],
        questionTypes: { mcq: 60, truefalse: 20, shortAnswer: 20 },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return createSuccessResponse(adaptiveQuiz,  201);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return createErrorResponse('Failed to generate quiz', 500);
  }
}