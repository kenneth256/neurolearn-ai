import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface InterventionRequest {
  mood: string;
  intensity: number;
  lessonContent?: any;
  learnerContext?: {
    recentPerformance?: number;
    strugglingConcepts?: string[];
    learningStyle?: string;
  };
}

export interface InterventionResponse {
  type: string;
  content: {
    question?: {
      text: string;
      options: Array<{ text: string; correct: boolean; explanation: string }>;
      difficulty: "easy" | "medium" | "hard";
    };
    encouragement?: {
      message: string;
      actionItems: string[];
    };
    hint?: {
      level: "gentle" | "moderate" | "direct";
      text: string;
      relatedConcepts: string[];
    };
    simplification?: {
      simplifiedText: string;
      keyPoints: string[];
      analogy?: string;
    };
  };
  estimatedTime: number; 
}

export async function generateMoodIntervention(
  request: InterventionRequest
): Promise<InterventionResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildInterventionPrompt(request);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text().trim();

  text = text.replace(/^```json\s*/gi, "");
  text = text.replace(/^```\s*/gi, "");
  text = text.replace(/\s*```$/gi, "");
  text = text.trim();

  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (parseError) {
    console.error("Failed to parse Gemini response:", text);
    
    return {
      type: "ENCOURAGEMENT",
      content: {
        encouragement: {
          message: "Keep going! You're making progress.",
          actionItems: ["Take a short break", "Review the material"]
        }
      },
      estimatedTime: 2
    };
  }
}

function buildInterventionPrompt(request: InterventionRequest): string {
  const { mood, intensity, lessonContent, learnerContext } = request;

  
  let strategy = "";

  if (mood === "FRUSTRATED" || mood === "OVERWHELMED") {
    strategy = `
The learner is feeling ${mood.toLowerCase()} with intensity ${intensity}/5.
Generate a SUPPORTIVE intervention that:
1. Acknowledges their frustration
2. Provides an easier comprehension check question (difficulty: easy)
3. Offers a helpful hint or simplified explanation
4. Includes encouragement to persist

Focus on rebuilding confidence.
`;
  } else if (mood === "CONFUSED") {
    strategy = `
The learner is confused (intensity ${intensity}/5).
Generate a CLARIFYING intervention that:
1. Identifies likely confusion points in the lesson
2. Provides a medium-difficulty question to check understanding
3. Offers a targeted hint addressing the confusion
4. Suggests reviewing specific prior concepts if needed

Focus on diagnosis and targeted help.
`;
  } else if (mood === "BORED") {
    strategy = `
The learner is bored (intensity ${intensity}/5).
Generate a CHALLENGING intervention that:
1. Increases difficulty level (medium to hard question)
2. Introduces an interesting application or edge case
3. Presents a thought-provoking scenario
4. Suggests skipping to more advanced content if appropriate

Focus on re-engagement through challenge.
`;
  } else if (mood === "ENGAGED" || mood === "EXCITED") {
    strategy = `
The learner is ${mood.toLowerCase()} (intensity ${intensity}/5).
Generate a REINFORCING intervention that:
1. Provides a medium-difficulty question to check mastery
2. Celebrates their progress
3. Suggests next steps or related topics
4. Maintains momentum

Focus on validation and progression.
`;
  } else {
   
    strategy = `
The learner has neutral mood (intensity ${intensity}/5).
Generate a STANDARD intervention that:
1. Provides a balanced comprehension check question
2. Offers optional hints
3. Maintains engagement without being intrusive

Focus on steady progress.
`;
  }

  const lessonContext = lessonContent
    ? `
LESSON CONTENT:
Title: ${lessonContent.title || "Current Lesson"}
Key Concepts: ${JSON.stringify(lessonContent.coreContent?.keyPoints || [])}
Learning Objectives: ${JSON.stringify(lessonContent.learningObjectives || [])}
`
    : "No specific lesson context available.";

  const learnerInfo = learnerContext
    ? `
LEARNER CONTEXT:
Recent Performance: ${learnerContext.recentPerformance || "N/A"}%
Struggling With: ${learnerContext.strugglingConcepts?.join(", ") || "Unknown"}
Learning Style: ${learnerContext.learningStyle || "Not specified"}
`
    : "";

  return `
You are an adaptive learning AI tutor. Generate a personalized intervention for a learner.

${strategy}

${lessonContext}

${learnerInfo}

CRITICAL: Return ONLY valid JSON with no markdown formatting, no backticks, no code fences.

RESPONSE FORMAT (JSON):
{
  "type": "ADAPTIVE_QUESTION" | "ENCOURAGEMENT" | "HINT" | "CONTENT_SIMPLIFICATION" | "BREAK_SUGGESTION",
  "content": {
    "question": {
      "text": "Clear, engaging question text",
      "options": [
        { "text": "Option A", "correct": true, "explanation": "Why this is correct" },
        { "text": "Option B", "correct": false, "explanation": "Why this is wrong" },
        { "text": "Option C", "correct": false, "explanation": "Why this is wrong" }
      ],
      "difficulty": "easy" | "medium" | "hard"
    },
    "encouragement": {
      "message": "Supportive message tailored to their mood",
      "actionItems": ["Specific step 1", "Specific step 2"]
    },
    "hint": {
      "level": "gentle" | "moderate" | "direct",
      "text": "Helpful hint without giving away the answer",
      "relatedConcepts": ["Concept 1", "Concept 2"]
    },
    "simplification": {
      "simplifiedText": "Simpler explanation of the concept",
      "keyPoints": ["Point 1", "Point 2"],
      "analogy": "Real-world analogy to help understanding"
    }
  },
  "estimatedTime": 60
}

IMPORTANT: 
- Only include the content fields relevant to the intervention type
- Make questions directly related to the lesson content
- Keep language clear, encouraging, and age-appropriate
- Provide actionable feedback
`;
}