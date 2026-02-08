// src/app/api/mood/analytics/route.ts
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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const days = parseInt(searchParams.get('days') || '7');

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const where: any = {
      userId: user.userId,
      timestamp: { gte: dateFrom }
    };
    if (enrollmentId) where.enrollmentId = enrollmentId;

    const moodEntries = await prisma.moodEntry.findMany({
      where,
      select: {
        mood: true,
        intensity: true,
        timestamp: true,
        trigger: true
      }
    });

    const moodDistribution = moodEntries.reduce((acc: any, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const averageIntensity = moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length || 0;

    const boredomInstances = moodEntries.filter(e => e.mood === 'BORED').length;
    const boredomRate = (boredomInstances / moodEntries.length) * 100 || 0;

    const analytics = {
      moodDistribution,
      averageIntensity,
      boredomRate,
      totalEntries: moodEntries.length,
      commonTriggers: moodEntries
        .filter(e => e.trigger)
        .reduce((acc: any, entry) => {
          acc[entry.trigger!] = (acc[entry.trigger!] || 0) + 1;
          return acc;
        }, {})
    };

    return createSuccessResponse(analytics, 200);
  } catch (error) {
    console.error('Error fetching mood analytics:', error);
    return createErrorResponse('Failed to fetch analytics', 500);
  }
}