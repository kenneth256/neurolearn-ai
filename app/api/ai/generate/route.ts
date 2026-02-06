import { NextResponse } from 'next/server';
import { FormData } from "@/app/constants/actions";
import { courseGenPrompt } from "@/app/constants/utils";

export async function POST(req: Request) {
  try {
    const params: FormData = await req.json();
    
    console.log("Received params:", params);
    
    const prompt = courseGenPrompt(params);
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ 
        success: false,
        error: "Gemini API key not configured" 
      }, { status: 500 });
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    console.log("Calling Gemini API...");
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 20000,
          responseMimeType: "application/json",
        },
      }),
    });

    console.log("Gemini response status:", response.status);

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Gemini Error:", responseText);
      return NextResponse.json({ 
        success: false,
        error: `Gemini API error: ${response.statusText}`,
        details: responseText
      }, { status: response.status });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText.substring(0, 500));
      return NextResponse.json({ 
        success: false,
        error: "Invalid JSON response from Gemini" 
      }, { status: 500 });
    }

    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("No AI text in response:", result);
      return NextResponse.json({ 
        success: false,
        error: "No content returned from Gemini" 
      }, { status: 500 });
    }

    console.log("AI text length:", aiText.length);
    console.log("AI text preview:", aiText.substring(0, 200));

    
    let cleanedText = aiText.trim();
    
    
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    cleanedText = cleanedText.trim();

   
    try {
      JSON.parse(cleanedText);
    } catch (jsonError) {
      console.error("AI returned invalid JSON:", cleanedText.substring(0, 500));
      return NextResponse.json({ 
        success: false,
        error: "AI generated invalid JSON format",
        preview: cleanedText.substring(0, 200)
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      course: cleanedText, 
      metadata: {
        subject: params.subject,
        level: params.level,
        goals: params.goals,
        style: params.style,
        time: params.time,
        deadline: params.deadline,
        generatedAt: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error("Failed to generate course via Gemini:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}