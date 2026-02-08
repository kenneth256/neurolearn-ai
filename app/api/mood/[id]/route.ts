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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { actionTaken, wasHelpful } = body;

    const moodEntry = await prisma.moodEntry.update({
      where: {
        id: id,
        userId: user.userId
      },
      data: {
        actionTaken,
        wasHelpful
      }
    });

    return createSuccessResponse(moodEntry, 200);
  } catch (error) {
    console.error('Error updating mood entry:', error);
    return createErrorResponse('Failed to update mood entry', 500);
  }
}