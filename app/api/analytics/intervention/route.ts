// src/app/api/analytics/interventions/route.ts

import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse, verifyToken } from "../../lib/auth/auth";
import { prisma } from "../../lib/prisma";


async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get("enrollmentId");

    
    const stats = await prisma.moodIntervention.groupBy({
      by: ["interventionType", "wasHelpful"],
      where: {
        userId: user.userId,
        enrollmentId: enrollmentId || undefined,
      },
      _count: true,
      _avg: {
        responseTime: true,
      },
    });

    // Get mood improvement patterns
    const moodProgressions = await prisma.$queryRaw`
      SELECT 
        me1.mood as before_mood,
        me2.mood as after_mood,
        COUNT(*) as occurrences
      FROM mood_entries me1
      JOIN mood_interventions mi ON me1.id = mi.mood_entry_id
      JOIN mood_entries me2 ON me2.user_id = me1.user_id 
        AND me2.enrollment_id = me1.enrollment_id
        AND me2.timestamp > me1.timestamp
        AND me2.timestamp < me1.timestamp + INTERVAL '30 minutes'
      WHERE me1.user_id = ${user.userId}
      GROUP BY before_mood, after_mood
      ORDER BY occurrences DESC
    `;

    return createSuccessResponse(
      {
        interventionStats: stats,
        moodProgressions,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching intervention analytics:", error);
    return createErrorResponse("Failed to fetch analytics", 500);
  }
}