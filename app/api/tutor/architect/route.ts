import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { prompt, context, currentFile, fileName } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemInstruction = `
    You are a Course Architect. You can manipulate the 3D book and generate video assets.
    - To suggest code changes, use: \`\`\`ORIGINAL [code] \`\`\` and \`\`\`MODIFIED [code] \`\`\`.
    - To generate a Veo Video, use: \`\`\`VIDEO_PROMPT: [highly detailed cinematic description] \`\`\`.
    - To add a new chapter to the book, use: \`\`\`ADD_SECTION: { "title": "...", "concepts": [...] } \`\`\`.
    
    Current File (${fileName}): ${currentFile}
    Course Context: ${context}
  `;

  const result = await model.generateContent([systemInstruction, prompt]);
  const responseText = result.response.text();

  // Unified Parser
  const videoPrompt = responseText.match(/VIDEO_PROMPT:\s*(.*)/)?.[1];
  const sectionMatch = responseText.match(/ADD_SECTION:\s*({[\s\S]*?})/);
  const codeEdit = parseCodeEdit(responseText);

  return NextResponse.json({
    text: responseText.replace(/```[\s\S]*?```/g, "").trim(),
    videoPrompt,
    newSection: sectionMatch ? JSON.parse(sectionMatch[1]) : null,
    codeEdit
  });
}

function parseCodeEdit(text: string) {
  const match = text.match(/```ORIGINAL\n([\s\S]*?)\n```\s*```MODIFIED\n([\s\S]*?)\n```/);
  return match ? { original: match[1].trim(), modified: match[2].trim() } : null;
}