import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../redis/client';
import { prisma } from '../../lib/prisma';
import type { SpacedRepetitionJobData, SpacedRepetitionJobResult } from './queue';

const connection = getRedisClient();

async function processSpacedRepetitionSweep(
    job: Job<SpacedRepetitionJobData>
): Promise<SpacedRepetitionJobResult> {
    console.log(`🧠 [Job ${job.id}] Running Daily Spaced Repetition Sweep at: ${job.data.timestamp}`);

    try {
        const now = new Date();

        // Find all uncompleted ReviewItems that are due
        const reviewsDue = await prisma.reviewItem.findMany({
            where: {
                completed: false, // In practice, if you mark SM2 items as complete you're done; if it just reschedules, ignore completed flag or repurpose it
                dueDate: {
                    lte: now, // Due date is in the past or now
                },
            },
            include: {
                enrollment: {
                    include: {
                        user: true, // Need user email to send notification (if hooked up)
                        course: true,
                    }
                }
            }
        });

        if (reviewsDue.length === 0) {
            console.log(`✅ [Job ${job.id}] 0 reviews due. System optimal.`);
            return { success: true, reviewsProcessed: 0, usersNotified: 0 };
        }

        // Group items by user so we don't spam them with 50 emails
        const reviewsByUser = new Map<string, typeof reviewsDue>();
        for (const review of reviewsDue) {
            const uId = review.enrollment.userId;
            if (!reviewsByUser.has(uId)) {
                reviewsByUser.set(uId, []);
            }
            reviewsByUser.get(uId)?.push(review);
        }

        console.log(`🧠 [Job ${job.id}] Found ${reviewsDue.length} pending reviews across ${reviewsByUser.size} users.`);

        // Process Notifications (Mocked out for now until you add Resend/SendGrid)
        // Here we'd send one consolidated email per user summarizing what they are forgetting today.
        let notifiedCount = 0;
        for (const [userId, userReviews] of reviewsByUser.entries()) {
            const userEmail = userReviews[0].enrollment.user.email;
            const courseName = userReviews[0].enrollment.course.title;
            // console.log(`📧 Dispatching notification to ${userEmail}: You have ${userReviews.length} concepts to review in ${courseName}!`);
            notifiedCount++;
        }

        // You could also create in-app UserNotification models here if the schema supports it.

        return {
            success: true,
            reviewsProcessed: reviewsDue.length,
            usersNotified: notifiedCount,
        };

    } catch (error) {
        console.error(`❌ [Job ${job.id}] Sweep failed:`, error);
        return {
            success: false,
            reviewsProcessed: 0,
            usersNotified: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export const spacedRepetitionWorker = new Worker<SpacedRepetitionJobData, SpacedRepetitionJobResult>(
    'spaced-repetition',
    processSpacedRepetitionSweep,
    {
        connection,
        concurrency: 1, // Sweeps only need 1 active processor to avoid race conditions
    }
);

spacedRepetitionWorker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed. Processed ${result?.reviewsProcessed} reviews.`);
});

spacedRepetitionWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

spacedRepetitionWorker.on('error', (err) => {
    console.error('❌ Worker error:', err);
});

console.log('🗓️  Spaced Repetition worker started listening.');
