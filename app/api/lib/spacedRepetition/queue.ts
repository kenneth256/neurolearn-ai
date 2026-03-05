import { Queue, QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis/client';

export interface SpacedRepetitionJobData {
    timestamp: string; // ISO date string of when this cron ran
}

export interface SpacedRepetitionJobResult {
    success: boolean;
    reviewsProcessed: number;
    usersNotified: number;
    error?: string;
}

const connection = getRedisClient();

// Create the daily cron queue
export const spacedRepetitionQueue = new Queue<SpacedRepetitionJobData>('spaced-repetition', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 10,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export const spacedRepetitionEvents = new QueueEvents('spaced-repetition', {
    connection,
});

/**
 * Ensures that the daily repeatable cron job is registered.
 * This should be called once when the worker boots up.
 */
export async function registerDailySpacedRepetitionCron() {
    await spacedRepetitionQueue.add(
        'daily-sweep',
        { timestamp: new Date().toISOString() },
        {
            repeat: {
                pattern: '0 8 * * *', // Run exactly at 8:00 AM every day
            },
            jobId: 'daily-spaced-repetition-cron',
        }
    );
    console.log('🗓️  Registered Daily Spaced Repetition Sync (8:00 AM cron)');
}
