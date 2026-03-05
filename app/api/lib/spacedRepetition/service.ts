import { prisma } from '../../lib/prisma';
import { calculateNextReview } from './algorithm';

export async function processSpacedRepetitionReview(
    reviewItemId: string,
    userId: string,
    quality: number // 0-5 scale
) {
    // 1. Fetch the ReviewItem to get its current state
    const reviewItem = await prisma.reviewItem.findUnique({
        where: { id: reviewItemId },
        include: {
            enrollment: true,
        },
    });

    if (!reviewItem) {
        throw new Error('Review Item not found');
    }

    // Ensure security: the user processing this review must own the enrollment
    if (reviewItem.enrollment.userId !== userId) {
        throw new Error('Unauthorized Access to Review Item');
    }

    // 2. Calculate the next SM-2 interval
    const result = calculateNextReview(
        quality,
        reviewItem.repetitionCount,
        reviewItem.easinessFactor,
        reviewItem.interval
    );

    // 3. Update the item in the database
    const updatedItem = await prisma.reviewItem.update({
        where: { id: reviewItemId },
        data: {
            repetitionCount: result.repetitionCount,
            easinessFactor: result.easinessFactor,
            interval: result.interval,
            dueDate: result.dueDate,
            lastReviewed: new Date(),
            // Optional logic based on app needs: if quality is high, maybe mark true?
            // For now, spacing just reschedules indefinitely until manually completed.
        },
    });

    return {
        success: true,
        nextReviewDue: result.dueDate,
        repetitionCount: result.repetitionCount,
        easinessFactor: result.easinessFactor
    };
}
