import { CourseModule, LessonDesignParams, lessonDesignPrompt } from "@/app/constants/utils";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  console.log("Received request to generate lessons");
  
  try {
    const body = await req.json();
    const { course } = body;
    
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course data is required' }, { status: 400 });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API key not configured' }, { status: 500 });
    }

    const { userLevel, learningStyle, availableTime, ...moduleData } = course;
    const lessonParams: LessonDesignParams = {
      module: moduleData as CourseModule,
      userLevel: userLevel || 'Intermediate',
      learningStyle: learningStyle || 'Hands-on practice',
      availableTime: availableTime || '2 hours per day'
    };
    
    const prompt = lessonDesignPrompt(lessonParams);
    console.log('Generating lessons for module:', moduleData.moduleNumber, moduleData.moduleName);

    // --- RETRY LOGIC START ---
    let attempts = 0;
    const maxRetries = 3;
    let response;
    let data: any;

    while (attempts <= maxRetries) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 40000,
              responseMimeType: "application/json"
            }
          })
        }
      );

      data = await response.json();

      // If successful, break out of the loop
      if (response.ok) break;

      // Check if the error is a 503 (Overloaded) or 429 (Rate Limit)
      const isRetryable = response.status === 503 || response.status === 429;

      if (isRetryable && attempts < maxRetries) {
        attempts++;
        const waitTime = Math.pow(2, attempts) * 5000; // 10s, 20s, 40s
        console.warn(`Gemini overloaded (${response.status}). Retrying in ${waitTime}ms... (Attempt ${attempts})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // If it's a 400/500 error that isn't overload, or we're out of retries
        console.error('Gemini API final error:', data);
        throw new Error(data.error?.message || `Gemini API failed with status ${response.status}`);
      }
    }
    // --- RETRY LOGIC END ---

    // *** ENHANCED DEBUGGING ***
    console.log('Response status:', response?.status);
    console.log('Full Gemini response structure:', JSON.stringify(data, null, 2));
    console.log('Has candidates?', !!data.candidates);
    console.log('Candidates length:', data.candidates?.length);
    console.log('Has content?', !!data.candidates?.[0]?.content);
    console.log('Has parts?', !!data.candidates?.[0]?.content?.parts);
    console.log('Parts length:', data.candidates?.[0]?.content?.parts?.length);

    const lessonContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('Extracted lesson content length:', lessonContent?.length || 0);
    console.log('First 200 chars of content:', lessonContent?.substring(0, 200));
    
    if (!lessonContent) {
      console.error('❌ EXTRACTION FAILED - Response structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length,
        firstCandidate: data.candidates?.[0],
        finishReason: data.candidates?.[0]?.finishReason,
        safetyRatings: data.candidates?.[0]?.safetyRatings
      });
      throw new Error('No lesson content generated - check logs for response structure');
    }
    
    let parsedLessons;
    try {
      parsedLessons = JSON.parse(lessonContent);
      console.log('✅ Successfully parsed lessons');
    } catch (parseError) {
      console.error('❌ Failed to parse lesson JSON:', parseError);
      console.error('Raw content that failed to parse:', lessonContent);
      throw new Error('Invalid JSON response from AI');
    }

    return NextResponse.json({
      success: true,
      lessons: parsedLessons,
      metadata: {
        moduleName: moduleData.moduleName || parsedLessons.moduleTitle || 'Unknown Module',
        moduleNumber: moduleData.moduleNumber || parsedLessons.moduleNumber || 0,
        userLevel: userLevel || 'Not specified',
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating lessons:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}