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

export async function GET(
  req: NextRequest,
  
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
   
    const { id } = await params;

    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const quiz = await prisma.adaptiveQuiz.findUnique({
      where: {
        id: id, 
        userId: user.userId
      },
      include: {
        attempts: {
          orderBy: { submittedAt: 'desc' }
        },
        lessonModule: true,
        courseModule: true
      }
    });

    if (!quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    return createSuccessResponse(quiz, 200);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return createErrorResponse('Failed to fetch quiz', 500);
  }
}