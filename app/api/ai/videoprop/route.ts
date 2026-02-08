import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import crypto from "crypto";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

interface VideoPromptParams {
  content: string;
  lessonData?: any;
  moduleData?: any;
  customContext?: string;
}

function videoPromptGeneration(params: VideoPromptParams): string {
  const { content, lessonData, moduleData, customContext } = params;
  

  const contentSections: string[] = [];

  if (content) {
    contentSections.push(`CONTENT TO VISUALIZE:\n${content.slice(0, 2000)}`);
  }

  if (lessonData) {
    contentSections.push(`LESSON CONTEXT:\n${JSON.stringify(lessonData, null, 2)}`);
  }

  if (moduleData) {
    contentSections.push(`MODULE CONTEXT:\n${JSON.stringify(moduleData, null, 2)}`);
  }

  if (customContext) {
    contentSections.push(`ADDITIONAL CONTEXT:\n${customContext}`);
  }

  return `You are a creative video prompt generator for educational AI video generation.

${contentSections.join('\n\n')}

Create a detailed, cinematic video prompt that:
1. Captures the core educational concept visually
2. Translates abstract ideas into concrete visual metaphors
3. Includes specific cinematography (camera angles, movements, lighting)
4. Specifies atmosphere, mood, and color palette
5. Is optimized for AI video generation (clear, specific, achievable)

Guidelines:
- Length: 3-5 sentences min length 
- Style: Cinematic and engaging
- Focus: Visual storytelling that enhances learning
- Clarity: Specific enough for AI to generate consistently

Return a JSON object with this exact structure:
{
  "prompt": "Your detailed cinematic video prompt here. Include visual elements, camera movements, lighting, mood, and style. Be specific and descriptive.",
  "style": "documentary|cinematic|abstract|educational|illustrative",
  "keyVisuals": ["key visual 1", "key visual 2", "key visual 3"],
  "mood": "calm|energetic|mysterious|inspiring|professional",
  "suggestedDuration": 5
}

CRITICAL: Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations outside the JSON.`;
}



export async function POST(req: NextRequest) {
  console.log("📹 Received request to generate video prompt");

  try {
    const body = await req.json();
    const { context } = body;

    if (!context) {
      return NextResponse.json(
        { success: false, error: "Content context is required" },
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

    const contentText =
      context.pageContent ||
      (context.lessonData ? JSON.stringify(context.lessonData) : "") ||
      context.customContext ||
      "No content provided";

    const promptParams: VideoPromptParams = {
      content: contentText,
      lessonData: context.lessonData,
      moduleData: context.moduleData,
      customContext: context.customContext,
    };

    const prompt = videoPromptGeneration(promptParams);

    console.log("🎬 Generating video prompt from content...");

    let attempts = 0;
    const maxRetries = 3;
    let response: Response | undefined;
    let data: GeminiResponse | undefined;

    while (attempts <= maxRetries) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      data = await response.json();

      if (response.ok) break;

      const isRetryable = response.status === 503 || response.status === 429;
      if (isRetryable && attempts < maxRetries) {
        attempts++;
        const waitTime = Math.pow(2, attempts) * 5000;
        console.warn(
          `⚠️ Gemini overloaded (${response.status}). Retrying in ${waitTime}ms... (Attempt ${attempts}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error("❌ Gemini API final error:", data);
        throw new Error(
          data?.error?.message ||
            `Gemini API failed with status ${response.status}`
        );
      }
    }
    
    if (!data) {
      throw new Error("Failed to get response from Gemini API after retries");
    }
    
    const promptContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!promptContent) {
      throw new Error(
        "No prompt content generated - check logs for response structure"
      );
    }

    let parsedPrompt: {
      prompt: string;
      style?: string;
      keyVisuals?: string[];
      mood?: string;
      suggestedDuration?: number;
    };

    try {
      parsedPrompt = JSON.parse(promptContent);
      console.log("✅ Successfully parsed video prompt");
    } catch (parseError) {
      console.error("❌ Failed to parse prompt JSON:", parseError);
      console.error("Raw content:", promptContent);

      const cleanContent = promptContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      try {
        parsedPrompt = JSON.parse(cleanContent);
        console.log("✅ Successfully parsed after cleaning");
      } catch (secondError) {
        throw new Error("Invalid JSON response from AI");
      }
    }

    if (!parsedPrompt.prompt || typeof parsedPrompt.prompt !== "string") {
      throw new Error("Generated response missing valid 'prompt' field");
    }

    // ✅ NEW: Create content hash for deduplication
    const contentHash = crypto
      .createHash("sha256")
      .update(parsedPrompt.prompt)
      .digest("hex");

    // ✅ NEW: Check if this prompt already exists
    let videoPromptRecord = await prisma.videoPrompt.findUnique({
      where: { contentHash },
    });

    if (videoPromptRecord) {
      console.log("♻️ Using existing video prompt:", videoPromptRecord.id);
      
      // Update usage stats
      await prisma.videoPrompt.update({
        where: { id: videoPromptRecord.id },
        data: {
          timesUsed: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    } else {
      // ✅ NEW: Save prompt to database
      console.log("💾 Saving new video prompt to database...");
      
      videoPromptRecord = await prisma.videoPrompt.create({
        data: {
          contentHash,
          masterPrompt: parsedPrompt.prompt,
          style: parsedPrompt.style || "cinematic",
          mood: parsedPrompt.mood || "professional",
          totalDuration: parsedPrompt.suggestedDuration || 5,
          isSegmented: false,
          segmentCount: 1,
          generatedBy: context.userId || "unknown",
          generationModel: "gemini-3-flash-preview",
          timesUsed: 1,
          lastUsedAt: new Date(),
          // Optional: Link to lesson/module if available
          lessonModuleId: context.lessonData?.id || null,
          courseModuleId: context.moduleData?.id || null,
        },
      });

      console.log("✅ Video prompt saved:", videoPromptRecord.id);
    }

    // ✅ NEW: Return promptId instead of just prompt text
    return NextResponse.json({
      success: true,
      promptId: videoPromptRecord.id, // ← This is what was missing!
      prompt: parsedPrompt.prompt,
      metadata: {
        style: parsedPrompt.style || "cinematic",
        keyVisuals: parsedPrompt.keyVisuals || [],
        mood: parsedPrompt.mood || "professional",
        suggestedDuration: parsedPrompt.suggestedDuration || 5,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error generating video prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}