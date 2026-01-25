export interface CourseGenParams {
  subject: string;
  level: string;
  goals: string;
  time: string;
  style: string;
  deadline: string;
}

export interface DailyLesson {
  day: number;
  title: string;
  duration: string;
  learningObjectives: string[];
  preLessonCheck: any;
  coreContent: any;
  handsOnPractice: any;
  knowledgeChecks: any;
  practicalApplication: any;
  commonPitfalls: string[];
  resources: any;
  spacedRepetition: any;
  exitCriteria: any;
}

export interface LessonsData {
  moduleTitle: string;
  moduleNumber: number;
  totalDuration: string;
  dailyLessons: DailyLesson[];
  weeklyMilestones: any[];
  differentiatedLearning: any;
  assessmentBlueprint: any;
}


export interface CourseModule {
  moduleNumber: number;
  moduleName: string;
  learningObjectives: string[];
  masteryRequirements: {
    threshold: string;
    criteria: string[];
  };
  assessmentMethods: Array<{
    type: string;
    description: string;
  }>;
  weeklyLearningPlan: {
    totalHours: number;
    dailyBreakdown: {
      [key: string]: string;
    };
    reviewCycle: string;
    tasks: string[];
  };
  resources: {
    documentation?: string[];
    githubRepos?: string[];
    practice?: string;
  };
  masteryVerification: {
    preAssessment: string;
    progressIndicators: string;
    remediation: string;
  };
}

export const courseGenPrompt = ({ subject, level, goals, time, style, deadline }: CourseGenParams) => `
You are an expert instructional designer and learning strategist with deep knowledge of mastery-based learning, spaced repetition, and cognitive science across all domains. I want you to design a personalized learning course for me with strict mastery requirements before progression.

Here are my details:

1. **Subject/Skill**: ${subject}
2. **Current Level**: ${level}
3. **Goals**: ${goals}
4. **Available Time**: ${time}
5. **Learning Style**: ${style}
6. **Deadline**: ${deadline}

Create a customized mastery-based learning course that includes:

**IMPORTANT: Adapt resources based on subject type:**

**If this is a coding/programming/technical subject:**
- Prioritize hands-on coding practice and real-world projects
- Use GitHub repositories, open-source projects, and code examples as primary learning resources
- Include Stack Overflow, GitHub Discussions, and technical documentation as problem-solving references
- Incorporate coding challenges from platforms like LeetCode, HackerRank, or Codewars
- Use official documentation, API references, and technical specifications
- Include code review practices and debugging exercises
- Recommend relevant GitHub repos to study, contribute to, or fork for practice

**If this is a non-coding subject:**
- Use subject-appropriate resources (books, courses, research papers, case studies, practical exercises)
- Include domain-specific platforms and communities
- Focus on hands-on application relevant to that field

Return ONLY valid JSON, no markdown, no explanation, no preamble. Just the array with complete module details.

Required JSON structure:
[
  {
    "moduleNumber": 1,
    "moduleName": "Module Title",
    "learningObjectives": [
      "Specific objective 1",
      "Specific objective 2",
      "Specific objective 3"
    ],
    "masteryRequirements": {
      "threshold": "90%",
      "criteria": [
        "Specific criterion 1",
        "Specific criterion 2"
      ]
    },
    "assessmentMethods": [
      {
        "type": "Coding Challenge",
        "description": "Detailed description of the assessment"
      }
    ],
    "weeklyLearningPlan": {
      "totalHours": 15,
      "dailyBreakdown": {
        "Mon-Fri": "2 hours (1h theory, 1h practice)",
        "Sat-Sun": "2.5 hours (project work)"
      },
      "reviewCycle": "Spaced Repetition: Day 1, 3, 7, 14, 30",
      "tasks": [
        "Specific task 1",
        "Specific task 2"
      ]
    },
    "resources": {
      "documentation": ["URL or resource name"],
      "githubRepos": ["repo-name/project"],
      "practice": "Platform name or exercise description"
    },
    "masteryVerification": {
      "preAssessment": "Description of pre-assessment",
      "progressIndicators": "Signs of readiness",
      "remediation": "Steps if below 90%"
    }
  }
]

Include:
- Spaced repetition schedule (review after 1, 3, 7, 14, 30 days)
- Clear mastery criteria (90% threshold)
- Subject-appropriate resources (GitHub repos for coding, books/courses for others)
- Weekly time breakdown based on available time: ${time}
- Realistic timeline for deadline: ${deadline}
- Adaptation guidelines for pacing
- Final capstone project in the last module
- provide enough information so one can learn and master the topic even if it means going passed their allocated time
`;

export interface LessonDesignParams {
  module: CourseModule;  
  userLevel: string;
  learningStyle: string;
  availableTime: string;
}


export const lessonDesignPrompt = ({ module, userLevel, learningStyle, availableTime }: LessonDesignParams): string => {
  const moduleData = JSON.stringify(module, null, 2);
  
  return `You are a world-class Instructional Designer. Your task is to generate an **Exhaustive, Deep-Dive Interactive Course Module**. 

### CRITICAL FIDELITY RULES:
1. **EXHAUSTIVE DETAIL**: The "narrativeExplanation" for each concept must be a minimum of 500-800 words. Do not summarize. Treat this as a definitive textbook chapter.
2. **THE "NO-BOOK" RULE**: Pair every concept with a "Why" scenario, Socratic inquiry, and "The Gotcha" edge case.
3. **EXTENDED SCOPE**: If the provided time (${availableTime}) is insufficient for true mastery, ignore the limit and provide the full depth required for a ${userLevel} student.
4. **PEDAGOGICAL DENSITY**: Every code walkthrough must analyze the "Big O" complexity and architectural trade-offs.

### Student Profile:
- Expertise: ${userLevel}
- Style: ${learningStyle}

### Source Material:
${moduleData}

### JSON STRUCTURE REQUIREMENTS:
- You MUST provide at least 3 distinct "concepts" per daily lesson.
- Each "narrativeExplanation" must be multi-paragraph, using Markdown for bolding and lists within the string.
- The "analysis" in codeWalkthrough must be line-by-line.

{
  "moduleTitle": "string",
  "moduleNumber": 1,
  "dailyLessons": [
    {
      "day": 1,
      "title": "string",
      "duration": "Extended",
      "learningObjectives": [...],
      "coreContent": {
        "concepts": [
          {
            "title": "string",
            "narrativeExplanation": "ESSENTIAL: Provide 5+ paragraphs of deep theory, historical context, and technical implementation details.",
            "interactiveAnalogy": "string",
            "codeWalkthrough": {
              "code": "string",
              "analysis": "A deep architectural breakdown of the code provided.",
              "language": "string"
            },
            "edgeCase": "string"
          }
        ]
      },
      ...
    }
  ],
  ...
}

IMPORTANT: 
- Return ONLY valid JSON.
- DO NOT use placeholders like "similar to before" or "content goes here".
- If you run out of space, prioritize the depth of the first two lessons over providing five shallow ones.
`;
};

// export const lessonDesignPrompt = ({ module, userLevel, learningStyle, availableTime }: LessonDesignParams): string => {
//   const moduleData = JSON.stringify(module, null, 2);
  
//   return `You are a world-class Instructional Designer. Your task is to generate a **Full, Interactive Course Module**. 

// ### THE "NO-BOOK" RULE:
// Do not just provide information. You must provide a **Learning Experience**. This means every concept must be paired with:
// 1. **The "Why"**: A real-world scenario where this concept solves a problem.
// 2. **Active Inquiry**: Socratic questions mid-explanation to make the student think.
// 3. **The "Gotcha"**: A non-obvious edge case or common misconception.
// 4. **Interactive Validation**: Knowledge checks that test logic, not just memorization.
// 5.povide enough information even if it means extending beyond provided time, goal is to make one understand

// ### Student Profile:
// - Expertise: ${userLevel}
// - Style: ${learningStyle}
// - Time: ${availableTime}

// ### Source Material:
// ${moduleData}

// ### JSON STRUCTURE:
// {
//   "moduleTitle": "string",
//   "moduleNumber": 1,
//   "dailyLessons": [
//     {
//       "day": 1,
//       "title": "string",
//       "duration": "${availableTime}",
//       "learningObjectives": [
//         {
//           "objective": "string",
//           "measurable": "A specific task the student will perform to prove mastery",
//           "timebound": "Minutes"
//         }
//       ],
//       "coreContent": {
//         "concepts": [
//           {
//             "title": "string",
//             "narrativeExplanation": "Deep dive tutorial content. Start with a problem, explain the theory, and end with a 'Check for Understanding' question.",
//             "interactiveAnalogy": "A relatable comparison that requires the student to visualize the logic.",
//             "codeWalkthrough": {
//               "code": "Production-grade, fully commented code.",
//               "analysis": "Explain what happens on specific lines. Why did we choose this pattern over another?",
//               "language": "string"
//             },
//             "edgeCase": "Explain a scenario where this concept might fail or behave unexpectedly."
//           }
//         ]
//       },
//       "handsOnPractice": {
//         "exercises": [
//           {
//             "title": "string",
//             "challenge": "A problem statement that doesn't give away the answer.",
//             "constraints": ["Required tools/methods to use"],
//             "starterCode": "Partial code with 'TODO' comments",
//             "hints": ["Clues that guide logic without providing the solution"],
//             "fullSolution": "The 'Gold Standard' code for this exercise",
//             "explanationOfSolution": "Why this specific implementation is the most efficient."
//           }
//         ]
//       },
//       "knowledgeChecks": {
//         "questions": [
//           {
//             "type": "multiple-choice",
//             "question": "A logic-based question (e.g., 'What happens if we change X to Y?')",
//             "options": ["string"],
//             "correctAnswer": "string",
//             "feedback": "Detailed explanation of why the correct answer is right AND why distractors are wrong."
//           }
//         ]
//       },
//       "commonPitfalls": [
//         {
//           "mistake": "The common error",
//           "mentalModelFix": "The shift in thinking needed to avoid this",
//           "debuggingHack": "The specific log or tool to use to catch this early"
//         }
//       ]
//     }
//   ],
//   "assessmentBlueprint": {
//     "finalProject": {
//       "prompt": "A cumulative challenge",
//       "requirements": ["Must include X", "Must handle Y"],
//       "rubric": ["Criterion: How to grade it"]
//     }
//   }
// }

// IMPORTANT: 
// - Escape all JSON strings.
// - Prioritize ${learningStyle} activities.
// - Make the content challenging enough for ${userLevel} level.
// - Ensure the total time to complete matches ${availableTime}.
// `;
// };