import { CourseGenParams, courseGenPrompt } from "@/app/constants/utils";
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
  console.log("Received request to generate course");
  
  try {
    const body: CourseGenParams = await req.json();
    const { subject, level, goals, time, style, deadline } = body;
    
    // Validate required fields
    if (!subject || !level || !goals || !time || !style || !deadline) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required: subject, level, goals, time, style, deadline'
        },
        { status: 400 }
      );
    }
    
    console.log("Request body validated:", body);
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured'
        },
        { status: 500 }
      );
    }
    
    const prompt = courseGenPrompt({ subject, level, goals, time, style, deadline });
    
    console.log('generating..............');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          }
        })
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    console.log('Gemini Course Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Gemini API request failed');
    }
    
    const courseContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!courseContent) {
      console.error('No course content. Full response:', data);
      throw new Error('No course content generated');
    }
    
    console.log('Course content generated successfully');
    
    return NextResponse.json({
      success: true,
      course: courseContent,
      metadata: {
        subject,
        level,
        goals,
        style,      
        time,       
        deadline,   
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}