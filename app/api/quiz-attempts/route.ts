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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const {
      adaptiveQuizId,
      answers,
      timeSpentSeconds,
      struggledQuestions
    } = body;

    const quiz = await prisma.adaptiveQuiz.findUnique({
      where: { id: adaptiveQuizId },
      select: { questions: true, totalQuestions: true, enrollmentId: true }
    });

    if (!quiz) {
      return createErrorResponse('Quiz not found', 404);
    }

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;

    const score = (correctAnswers / quiz.totalQuestions) * 100;
    const averageTimePerQuestion = timeSpentSeconds / quiz.totalQuestions;

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        adaptiveQuizId,
        userId: user.userId,
        answers,
        score,
        correctAnswers,
        incorrectAnswers,
        skippedQuestions,
        timeSpentSeconds,
        averageTimePerQuestion,
        struggledQuestions,
        aiFeedback: 'AI-generated feedback will be added here',
        strengthAreas: [],
        improvementAreas: [],
        nextSteps: [],
        completionPattern: averageTimePerQuestion < 30 ? 'rushed' : 'careful',
        confidenceLevel: score > 80 ? 0.9 : score > 60 ? 0.7 : 0.5
      }
    });

    await prisma.learnerProfile.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        averageAccuracy: score
      },
      update: {
        averageAccuracy: {
          increment: score / 10
        }
      }
    });

    // --- SPACED REPETITION INTEGRATION ---
    // If the user struggled with any concepts, schedule them for a Spaced Repetition review tomorrow.
    if (struggledQuestions && Array.isArray(struggledQuestions) && struggledQuestions.length > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Create a ReviewItem for each struggled concept
      const reviewItemsToCreate = struggledQuestions.map((questionId: string) => ({
        enrollmentId: quiz.enrollmentId, // Make sure we grab enrollmentId from the quiz query
        moduleNumber: 1, // Fallback; would ideally pull from quiz.courseModule.moduleNumber
        conceptId: questionId,
        dueDate: tomorrow,
        repetitionCount: 0,
        easinessFactor: 2.5,
        interval: 1,
        completed: false
      }));

      if (quiz.enrollmentId) {
        await prisma.reviewItem.createMany({
          data: reviewItemsToCreate
        });
        console.log(`[SpacedRepetition] Scheduled ${reviewItemsToCreate.length} reviews for user ${user.userId}`);
      }
    }
    // -------------------------------------

    return createSuccessResponse(quizAttempt, 201);
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return createErrorResponse('Failed to submit quiz attempt', 500);
  }
}