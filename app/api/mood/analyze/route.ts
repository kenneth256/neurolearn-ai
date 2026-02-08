// app/api/mood/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      image,
      previousMood,
      moodHistory,
      sessionDuration,
      visibleContent,
    } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  
    const base64Data = image.split(",")[1] || image;

    const contextInfo = `
Session Context:
- Previous mood: ${previousMood || "None"}
- Recent mood history: ${moodHistory?.map((m: any) => `${m.mood} (intensity: ${m.intensity})`).join(", ") || "No history"}
- Session duration: ${sessionDuration || 0} minutes
- Currently viewing: ${visibleContent ? visibleContent.substring(0, 500) : "General course content"}

Current visible content summary:
${visibleContent || "Not specified"}
`;

    const prompt = `You are an expert educational psychologist analyzing student engagement and emotional state during online learning.

${contextInfo}

Analyze the student's facial expression and body language in this image. Consider:
1. Their current engagement level with the visible content
2. Signs of understanding or confusion about the material
3. Energy levels and focus
4. Any frustration or excitement related to the learning material

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "mood": "ENGAGED|NEUTRAL|BORED|FRUSTRATED|CONFUSED|EXCITED|OVERWHELMED",
  "intensity": <1-5>,
  "confidence": <0.0-1.0>,
  "trigger": "<brief description of what might be causing this mood in relation to the content>"
}

Guidelines:
- ENGAGED: Focused, leaning forward, eyes on screen, alert
- NEUTRAL: Calm, comfortable, present but not particularly energized
- BORED: Yawning, looking away, slouching, distracted
- FRUSTRATED: Furrowed brow, tense, hands on face, signs of struggle
- CONFUSED: Tilted head, uncertain expression, hesitant posture
- EXCITED: Bright eyes, smiling, animated, energetic
- OVERWHELMED: Hands covering face, distant stare, signs of cognitive overload

Consider the visible content context when determining the trigger. For example:
- If viewing code and looking frustrated → "Struggling with the code syntax"
- If viewing text explanations and looking confused → "Difficulty understanding the concept"
- If viewing exercises and looking engaged → "Actively working through the problem"

Intensity scale (1-5):
1 = Very mild
2 = Mild
3 = Moderate
4 = Strong
5 = Very strong

Be conservative with confidence scores. Only use >0.8 when very certain.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ]);

    const response = result.response.text();
    
    
    let cleanedResponse = response.trim();
    
   
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, "");
    cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    cleanedResponse = cleanedResponse.trim();

    const moodData = JSON.parse(cleanedResponse);

    // Validate the response
    const validMoods = [
      "ENGAGED",
      "NEUTRAL",
      "BORED",
      "FRUSTRATED",
      "CONFUSED",
      "EXCITED",
      "OVERWHELMED",
    ];

    if (!validMoods.includes(moodData.mood)) {
      throw new Error("Invalid mood detected");
    }

    if (
      typeof moodData.intensity !== "number" ||
      moodData.intensity < 1 ||
      moodData.intensity > 5
    ) {
      throw new Error("Invalid intensity level");
    }

    if (
      typeof moodData.confidence !== "number" ||
      moodData.confidence < 0 ||
      moodData.confidence > 1
    ) {
      throw new Error("Invalid confidence score");
    }

    return NextResponse.json({
      success: true,
      data: {
        mood: moodData.mood,
        intensity: moodData.intensity * 20, 
        confidence: moodData.confidence,
        trigger: moodData.trigger || "General learning state",
      },
    });
  } catch (error) {
    console.error("Mood analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze mood",
      },
      { status: 500 },
    );
  }
}