
import { NextRequest, NextResponse } from "next/server";
import { getVideoGenerationJobStatus } from "@/app/api/lib/videoQue/videoque"; 

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const { promptId } = await params;

    const jobStatus = await getVideoGenerationJobStatus(promptId);

    return NextResponse.json({
      success: true,
      ...jobStatus,
    });

  } catch (error) {
    console.error("❌ Failed to get job status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}