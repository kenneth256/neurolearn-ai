// src/app/api/mood/intervention/[id]/respond/route.ts

import { createErrorResponse, createSuccessResponse, verifyToken } from "@/app/api/lib/auth/auth";
import { prisma } from "@/app/api/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const { userResponse, wasHelpful, responseTime } = body;

    const intervention = await prisma.moodIntervention.update({
      where: {
        id,
        userId: user.userId,
      },
      data: {
        userResponse,
        wasHelpful,
        responseTime,
        respondedAt: new Date(),
      },
    });

    return createSuccessResponse(intervention, 200);
  } catch (error) {
    console.error("Error updating intervention:", error);
    return createErrorResponse("Failed to update intervention", 500);
  }
}