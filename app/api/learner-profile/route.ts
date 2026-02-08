
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../lib/prisma'; 
import { createErrorResponse, createSuccessResponse, verifyToken } from '../lib/auth/auth';


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

    let profile = await prisma.learnerProfile.findUnique({
      where: { userId: user.userId }
    });

    if (!profile) {
      profile = await prisma.learnerProfile.create({
        data: {
          userId: user.userId
        }
      });
    }

    return createSuccessResponse(profile, 200);
  } catch (error) {
    console.error('Error fetching learner profile:', error);
    return createErrorResponse('Failed to fetch profile', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();

    const profile = await prisma.learnerProfile.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        ...body
      },
      update: body
    });

    return createSuccessResponse(profile, 200);
  } catch (error) {
    console.error('Error updating learner profile:', error);
    return createErrorResponse('Failed to update profile', 500);
  }
}