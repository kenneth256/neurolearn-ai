
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../lib/prisma';
import { verifyToken, createErrorResponse, createSuccessResponse } from '../lib/auth/auth';

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
    const {
      enrollmentId,
      lessonModuleId,
      courseModuleId,
      adaptationReason,
      difficultyLevel,
      questions,
      totalQuestions,
      estimatedDuration,
      focusAreas,
      questionTypes,
      expiresAt
    } = body;

    const adaptiveQuiz = await prisma.adaptiveQuiz.create({
      data: {
        userId: user.userId,
        enrollmentId,
        lessonModuleId,
        courseModuleId,
        adaptationReason,
        difficultyLevel,
        questions,
        totalQuestions,
        estimatedDuration,
        focusAreas,
        questionTypes,
        expiresAt
      }
    });

    return createSuccessResponse(adaptiveQuiz, 201);
  } catch (error) {
    console.error('Error creating adaptive quiz:', error);
    return createErrorResponse('Failed to create adaptive quiz', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const lessonModuleId = searchParams.get('lessonModuleId');
    const active = searchParams.get('active') === 'true';

    const where: any = { userId: user.userId };
    if (enrollmentId) where.enrollmentId = enrollmentId;
    if (lessonModuleId) where.lessonModuleId = lessonModuleId;
    if (active) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    const quizzes = await prisma.adaptiveQuiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        attempts: {
          orderBy: { submittedAt: 'desc' },
          take: 1
        },
        lessonModule: true,
        courseModule: true
      }
    });

    return createSuccessResponse(quizzes, 200);
  } catch (error) {
    console.error('Error fetching adaptive quizzes:', error);
    return createErrorResponse('Failed to fetch quizzes', 500);
  }
}