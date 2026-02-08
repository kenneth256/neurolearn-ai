import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function generateWithLLM(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json", 
    },
  });

  const result = await model.generateContent({
   contents: [ {
      role: "user",
      parts: [{ text: prompt }],
    }],
});

  const response = result.response.text();

  if (!response) {
    throw new Error("Gemini returned empty response");
  }

  try {
    return JSON.parse(response);
  } catch (err) {
    console.error("Gemini invalid JSON:", response);
    throw new Error("Gemini returned invalid JSON");
  }
}
