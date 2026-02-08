// lib/queues/video-generation-worker.ts
import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../redis/client';
import { prisma } from '../../lib/prisma';
import { VeoClient } from '../veo/client'; 
import { VideoCompiler } from '../veo/video-compiler'; 
import { CloudinaryUploader } from '../cloudinary/cloudinary-uploader'; 
import type { VideoGenerationJobData, VideoGenerationJobResult } from './videoque'; 

const connection = getRedisClient();

async function processVideoGeneration(
  job: Job<VideoGenerationJobData>
): Promise<VideoGenerationJobResult> {
  const { promptId, userId } = job.data;

  console.log(`🎥 [Job ${job.id}] Starting video generation for prompt: ${promptId}`);

  try {
    // Update progress
    await job.updateProgress(10);

    // Fetch the video prompt with segments
    const videoPrompt = await prisma.videoPrompt.findUnique({
      where: { id: promptId },
      include: {
        segments: {
          orderBy: { segmentNumber: 'asc' },
          include: {
            generatedClips: {
              where: { status: 'COMPLETED' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        compiledVideos: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!videoPrompt) {
      throw new Error('Video prompt not found');
    }

    // Check if already compiled
    if (videoPrompt.compiledVideos.length > 0) {
      console.log(`✅ [Job ${job.id}] Using existing compiled video`);
      return {
        success: true,
        videoId: videoPrompt.compiledVideos[0].id,
      };
    }

    await job.updateProgress(20);

    // Initialize services
    const veoClient = new VeoClient();
    const cloudinary = new CloudinaryUploader();

    const totalSegments = videoPrompt.segments.length;
    const generatedClips: Array<{
      segmentId: string;
      videoUrl: string;
      duration: number;
      transition?: string;
    }> = [];

    // Generate each segment
    for (let i = 0; i < videoPrompt.segments.length; i++) {
      const segment = videoPrompt.segments[i];
      const progressPercent = 20 + ((i / totalSegments) * 60); // 20-80%
      
      await job.updateProgress(progressPercent);

      console.log(`🎬 [Job ${job.id}] Segment ${segment.segmentNumber}/${totalSegments}`);

      // Check if clip already exists
      if (segment.generatedClips.length > 0) {
        generatedClips.push({
          segmentId: segment.id,
          videoUrl: segment.generatedClips[0].videoUrl,
          duration: segment.generatedClips[0].duration,
          transition: segment.transitionOut || undefined,
        });
        continue;
      }

      // Update segment status
      await prisma.videoSegment.update({
        where: { id: segment.id },
        data: { status: 'GENERATING' },
      });

      // Generate with Veo 3
      const veoResponse = await veoClient.generateVideo({
        prompt: segment.segmentPrompt,
        duration: segment.targetDuration,
        style: videoPrompt.style,
      });

      // Poll until complete
      const completedJob = await veoClient.pollUntilComplete(veoResponse.jobId);

      if (!completedJob.videoUrl) {
        throw new Error(`No video URL for segment ${segment.segmentNumber}`);
      }

      // Upload to Cloudinary
      const uploaded = await cloudinary.uploadFromUrl(completedJob.videoUrl);

      // Save clip
      const clip = await prisma.generatedVideoClip.create({
        data: {
          videoSegmentId: segment.id,
          videoUrl: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          duration: uploaded.duration,
          generationService: 'veo-3',
          generationParams: {
            jobId: veoResponse.jobId,
            originalPrompt: segment.segmentPrompt,
          },
          status: 'COMPLETED',
        },
      });

      await prisma.videoSegment.update({
        where: { id: segment.id },
        data: { status: 'COMPLETED' },
      });

      generatedClips.push({
        segmentId: segment.id,
        videoUrl: clip.videoUrl,
        duration: clip.duration,
        transition: segment.transitionOut || undefined,
      });
    }

    await job.updateProgress(80);
    console.log(`🎞️ [Job ${job.id}] Compiling ${generatedClips.length} segments...`);

    // Compile videos
    let finalVideoUrl: string;
    let finalThumbnailUrl: string | null = null;
    let totalDuration = 0;

    if (generatedClips.length === 1) {
      finalVideoUrl = generatedClips[0].videoUrl;
      totalDuration = generatedClips[0].duration;
    } else {
      const compiler = new VideoCompiler();

      const compiledPath = await compiler.compileVideos(
        generatedClips.map(clip => ({
          videoUrl: clip.videoUrl,
          transition: clip.transition,
          duration: clip.duration,
        }))
      );

      const uploaded = await cloudinary.uploadVideo(compiledPath);
      finalVideoUrl = uploaded.url;
      finalThumbnailUrl = uploaded.thumbnailUrl;
      totalDuration = uploaded.duration;

      await compiler.cleanup();
    }

    await job.updateProgress(90);

    // Save compiled video
    const compiledVideo = await prisma.compiledVideo.create({
      data: {
        videoPromptId: videoPrompt.id,
        finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        totalDuration,
        segmentsUsed: generatedClips.map(c => c.segmentId),
        status: 'COMPLETED',
      },
    });

    await job.updateProgress(100);

    console.log(`✅ [Job ${job.id}] Video generation complete!`);

    return {
      success: true,
      videoId: compiledVideo.id,
    };

  } catch (error) {
    console.error(`❌ [Job ${job.id}] Video generation failed:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


export const videoGenerationWorker = new Worker<VideoGenerationJobData, VideoGenerationJobResult>(
  'video-generation',
  processVideoGeneration,
  {
    connection,
    concurrency: 2, // Process 2 videos at a time
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per minute
    },
  }
);

videoGenerationWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

videoGenerationWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

videoGenerationWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('🔧 Video generation worker started');