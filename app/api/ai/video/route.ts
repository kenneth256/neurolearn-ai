import { NextRequest, NextResponse } from "next/server";
import { GeminiVideoGenerator } from "../videogen/videoClass"; 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, aspectRatio, duration, numberOfVideos, image } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const generator = new GeminiVideoGenerator(apiKey);

    let result;
    if (image) {
      result = await generator.generateVideoFromImage(
        prompt,
        image.data,
        image.mimeType
      );
    } else {
      result = await generator.generateVideo({
        prompt,
        aspectRatio,
        duration,
        numberOfVideos,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: result.videos,
    });
  } catch (error) {
    console.error("Video generation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}