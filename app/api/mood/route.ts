// src/app/api/mood/route.ts
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
      mood,
      intensity,
      trigger,
      context,
      actionTaken,
      wasHelpful,
      metadata
    } = body;

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
        metadata
      }
    });

    return createSuccessResponse(moodEntry, 201);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return createErrorResponse('Failed to create mood entry', 500);
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = { userId: user.userId };
    if (enrollmentId) where.enrollmentId = enrollmentId;
    if (lessonModuleId) where.lessonModuleId = lessonModuleId;

    const moodEntries = await prisma.moodEntry.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        enrollment: {
          include: {
            course: true
          }
        },
        lessonModule: true,
        courseModule: true
      }
    });

    return createSuccessResponse(moodEntries, 200);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return createErrorResponse('Failed to fetch mood entries', 500);
  }
}