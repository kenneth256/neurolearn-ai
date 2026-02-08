
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis/client'; 
export interface VideoGenerationJobData {
  promptId: string;
  userId: string;
  priority?: number;
}

export interface VideoGenerationJobResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

const connection = getRedisClient();

// Create the queue
export const videoGenerationQueue = new Queue<VideoGenerationJobData>('video-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue Events (for monitoring)
export const videoGenerationEvents = new QueueEvents('video-generation', {
  connection,
});

// Helper function to add a job
export async function addVideoGenerationJob(
  data: VideoGenerationJobData
): Promise<Job<VideoGenerationJobData>> {
  return await videoGenerationQueue.add(
    'generate-video',
    data,
    {
      priority: data.priority || 10, 
      jobId: `video-${data.promptId}`, 
    }
  );
}


export async function getVideoGenerationJobStatus(promptId: string) {
  const jobId = `video-${promptId}`;
  const job = await videoGenerationQueue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    status: state,
    progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
  };
}