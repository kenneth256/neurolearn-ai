// app/api/video/generate-async/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addVideoGenerationJob } from "../../lib/videoQue/videoque";

export async function POST(req: NextRequest) {
  try {
    const { promptId, userId, priority } = await req.json();

    if (!promptId || !userId) {
      return NextResponse.json(
        { success: false, error: "promptId and userId required" },
        { status: 400 }
      );
    }

  
    const job = await addVideoGenerationJob({
      promptId,
      userId,
      priority,
    });

    console.log(`📋 Video generation job queued: ${job.id}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Video generation queued',
      promptId,
    });

  } catch (error) {
    console.error("❌ Failed to queue video generation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to queue job",
      },
      { status: 500 }
    );
  }
}