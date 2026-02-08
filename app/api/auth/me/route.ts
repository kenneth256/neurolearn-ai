import { NextRequest } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '../../lib/auth/auth';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        secondName: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        secondName: userData.secondName,
        bio: userData.bio,
        avatar: userData.avatar,
        role: userData.role,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return createErrorResponse('Internal server error', 500);
  }
}