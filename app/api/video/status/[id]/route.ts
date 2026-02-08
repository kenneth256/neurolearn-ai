import { NextRequest, NextResponse } from "next/server";
import { getVideoGenerationJobStatus } from "@/app/api/lib/videoQue/videoque"; 
import { prisma } from "@/app/api/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`📊 Checking status for job/prompt: ${id}`);

    let promptId: string;
    
    if (id.startsWith('video-')) {
      promptId = id.replace('video-', '');
    } else {
      promptId = id;
    }

    const jobStatus = await getVideoGenerationJobStatus(promptId);

    if (jobStatus.status === 'not_found') {
      const compiledVideo = await prisma.compiledVideo.findFirst({
        where: {
          videoPromptId: promptId,
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (compiledVideo) {
        return NextResponse.json({
          success: true,
          status: 'completed',
          videoId: compiledVideo.id,
          videoUrl: compiledVideo.finalVideoUrl,
          thumbnailUrl: compiledVideo.thumbnailUrl,
          duration: compiledVideo.totalDuration,
          completedAt: compiledVideo.createdAt,
        });
      }

      return NextResponse.json(
        {
          success: false,
          status: 'not_found',
          message: 'Job not found',
        },
        { status: 404 }
      );
    }

    const statusMap: Record<string, string> = {
      waiting: 'queued',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
      delayed: 'queued',
      paused: 'paused',
    };

    const mappedStatus = statusMap[jobStatus.status] || jobStatus.status;

    if (mappedStatus === 'completed' && jobStatus.result?.videoId) {
      const compiledVideo = await prisma.compiledVideo.findUnique({
        where: { id: jobStatus.result.videoId },
      });

      if (compiledVideo) {
        return NextResponse.json({
          success: true,
          status: 'completed',
          videoId: compiledVideo.id,
          videoUrl: compiledVideo.finalVideoUrl,
          thumbnailUrl: compiledVideo.thumbnailUrl,
          duration: compiledVideo.totalDuration,
          progress: 100,
          completedAt: compiledVideo.createdAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      progress: jobStatus.progress || 0,
      attemptsMade: jobStatus.attemptsMade,
      failedReason: jobStatus.failedReason,
      data: jobStatus.data,
    });
  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}