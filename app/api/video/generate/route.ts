import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 
import { VeoClient } from "../../lib/veo/client"; 
import { VideoCompiler } from "../../lib/veo/video-compiler"; 
import { CloudinaryUploader } from "../../lib/cloudinary/cloudinary-uploader"; 

interface GenerateVideoRequest {
  promptId: string;
  userId: string;
}

export async function POST(req: NextRequest) {
  console.log("🎥 Video generation request received");

  try {
    const body = await req.json() as GenerateVideoRequest;
    const { promptId, userId } = body;

    if (!promptId || !userId) {
      return NextResponse.json(
        { success: false, error: "promptId and userId are required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: "Video prompt not found" },
        { status: 404 }
      );
    }

    // Check if we already have a completed compiled video
    if (videoPrompt.compiledVideos.length > 0) {
      console.log("✅ Using existing compiled video");
      return NextResponse.json({
        success: true,
        cached: true,
        video: videoPrompt.compiledVideos[0],
      });
    }

    // Initialize services
    const veoClient = new VeoClient();
    const cloudinary = new CloudinaryUploader();

    console.log(`📊 Generating ${videoPrompt.segments.length} video segments`);

    // Generate each segment
    const generatedClips: Array<{
      segmentId: string;
      videoUrl: string;
      duration: number;
      transition?: string;
    }> = [];

    for (const segment of videoPrompt.segments) {
      console.log(`\n🎬 Processing segment ${segment.segmentNumber}/${videoPrompt.segments.length}`);

      // Check if this segment already has a completed clip
      if (segment.generatedClips.length > 0) {
        console.log(`  ✅ Using existing clip for segment ${segment.segmentNumber}`);
        generatedClips.push({
          segmentId: segment.id,
          videoUrl: segment.generatedClips[0].videoUrl,
          duration: segment.generatedClips[0].duration,
          transition: segment.transitionOut || undefined,
        });
        continue;
      }

      // Update segment status to GENERATING
      await prisma.videoSegment.update({
        where: { id: segment.id },
        data: { status: 'GENERATING' },
      });

      try {
        console.log(`  🎨 Calling Veo 3 API...`);
        
        // Generate video with Veo 3
        const veoResponse = await veoClient.generateVideo({
          prompt: segment.segmentPrompt,
          duration: segment.targetDuration,
          style: videoPrompt.style,
        });

        console.log(`  ⏳ Waiting for generation (Job ID: ${veoResponse.jobId})...`);

        // Poll until complete (max 5 minutes)
        const completedJob = await veoClient.pollUntilComplete(veoResponse.jobId);

        if (!completedJob.videoUrl) {
          throw new Error('No video URL in completed job');
        }

        console.log(`  ☁️  Uploading to Cloudinary...`);

        // Upload to Cloudinary
        const uploaded = await cloudinary.uploadFromUrl(completedJob.videoUrl);

        // Save the generated clip
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

        // Update segment status
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

        console.log(`  ✅ Segment ${segment.segmentNumber} complete`);

      } catch (error) {
        console.error(`  ❌ Failed to generate segment ${segment.segmentNumber}:`, error);

        // Update retry count and status
        await prisma.videoSegment.update({
          where: { id: segment.id },
          data: {
            status: 'FAILED',
            retryCount: { increment: 1 },
          },
        });

        // If this is critical, we might want to fail the whole thing
        throw error;
      }
    }

    console.log(`\n🎞️  All segments generated, compiling...`);

    // Compile all clips into final video
    let finalVideoUrl: string;
    let finalThumbnailUrl: string | null = null;
    let totalDuration: number = 0;

    if (generatedClips.length === 1) {
      // Single clip, no compilation needed
      finalVideoUrl = generatedClips[0].videoUrl;
      totalDuration = generatedClips[0].duration;
    } else {
      // Compile multiple clips
      const compiler = new VideoCompiler();

      try {
        const compiledPath = await compiler.compileVideos(
          generatedClips.map(clip => ({
            videoUrl: clip.videoUrl,
            transition: clip.transition,
            duration: clip.duration,
          }))
        );

        console.log(`  ☁️  Uploading compiled video...`);

        const uploaded = await cloudinary.uploadVideo(compiledPath);
        finalVideoUrl = uploaded.url;
        finalThumbnailUrl = uploaded.thumbnailUrl;
        totalDuration = uploaded.duration;

        await compiler.cleanup();
      } catch (error) {
        console.error('❌ Video compilation failed:', error);
        throw new Error('Failed to compile video segments');
      }
    }

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

    console.log(`✅ Video generation complete! Duration: ${totalDuration}s`);

    return NextResponse.json({
      success: true,
      cached: false,
      video: compiledVideo,
      metadata: {
        segmentsGenerated: generatedClips.length,
        totalDuration,
        generatedAt: compiledVideo.createdAt,
      },
    });

  } catch (error) {
    console.error("❌ Video generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}