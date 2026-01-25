import { CourseModule, LessonDesignParams, lessonDesignPrompt } from "@/app/constants/utils";
import { NextRequest, NextResponse } from "next/server";

// interface GeminiResponse {
//   candidates: Array<{
//     content: {
//       parts: Array<{
//         text: string;
//       }>;
//     };
//   }>;
//   error?: {
//     message: string;
//   };
// }



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
    console.log('Generating lessons...');

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
        const waitTime = Math.pow(2, attempts) * 5000; // 2s, 4s, 8s
        console.warn(`Gemini overloaded (503). Retrying in ${waitTime}ms... (Attempt ${attempts})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // If it's a 400/500 error that isn't overload, or we're out of retries
        console.error('Gemini API final error:', data);
        throw new Error(data.error?.message || `Gemini API failed with status ${response.status}`);
      }
    }
    // --- RETRY LOGIC END ---

    const lessonContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!lessonContent) {
      throw new Error('No lesson content generated');
    }
    
    let parsedLessons;
    try {
      parsedLessons = JSON.parse(lessonContent);
    } catch (parseError) {
      console.error('Failed to parse lesson JSON:', parseError);
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
    console.error('Error generating lessons:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}