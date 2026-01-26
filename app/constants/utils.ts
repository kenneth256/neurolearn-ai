import { ProjectData } from "../components/ui/protocol";

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
  moduleCapstone: ProjectData
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
  
  return `You are an expert Instructional Designer capable of creating deep, comprehensive course modules for ANY subject domain.

### Student Profile:
- Level: ${userLevel}
- Learning Style: ${learningStyle}
- Available Time: ${availableTime}

### Module to Design:
${moduleData}

### Your Mission:
Transform this module into daily lessons with DEEP, THOROUGH explanations that match the subject matter. Each lesson should provide complete understanding, not surface-level summaries.

### UNIVERSAL JSON STRUCTURE:
{
  "moduleTitle": "string",
  "moduleNumber": number,
  "subjectDomain": "string (e.g., 'Programming', 'Culinary Arts', 'Mathematics', 'Languages')",
  "totalDays": number,
  "dailyLessons": [
    {
      "day": number,
      "title": "string",
      "estimatedDuration": "string",
      "learningObjectives": ["string"],
      "theoreticalFoundation": {
        "concepts": [
          {
            "conceptTitle": "string",
            "deepDive": "string (3-4 paragraphs: What it is, Why it matters, How it works, When to use it)",
            "historicalContext": "string (origin, evolution, or foundational theory)",
            "realWorldApplication": "string (concrete examples from industry/practice)",
            "commonMisconceptions": ["string"]
          }
        ]
      },
      "practicalDemonstration": {
        "title": "string",
        "setup": "string (materials, prerequisites, or environment setup)",
        "stepByStep": [
          {
            "step": number,
            "instruction": "string",
            "explanation": "string (WHY this step matters)",
            "visualCue": "string (what to look for, expected result)"
          }
        ],
        "codeOrFormula": {
          "content": "string (code, recipe, formula, or procedure)",
          "language": "string (programming language, 'Recipe', 'Formula', 'Procedure', etc.)",
          "lineByLineAnalysis": [
            {
              "line": "string (the actual line/step)",
              "purpose": "string (what it does)",
              "technicalDetail": "string (deeper insight, optimization, or technique)"
            }
          ]
        },
        "expectedOutcome": "string",
        "troubleshooting": [
          {
            "problem": "string",
            "cause": "string",
            "solution": "string"
          }
        ]
      },
      "handsOnPractice": {
        "exerciseTitle": "string",
        "objective": "string",
        "instructions": ["string"],
        "successCriteria": ["string"],
        "timeEstimate": "string",
        "extensionChallenge": "string (for advanced learners)"
      },
      "knowledgeCheck": [
        {
          "type": "string (multiple-choice, practical, or open-ended)",
          "question": "string",
          "options": ["string"] || null,
          "correctAnswer": "string or number",
          "detailedExplanation": "string (why this answer is correct AND why others are wrong)"
        }
      ],
      "additionalResources": {
        "mustRead": ["string (articles, book chapters, documentation)"],
        "videoTutorials": ["string (if applicable)"],
        "practiceProblems": ["string"]
      }
    }
  ],
  "moduleCapstone": {
    "projectTitle": "string",
    "description": "string",
    "requirements": ["string"],
    "assessmentRubric": [
      {
        "criterion": "string",
        "excellent": "string",
        "satisfactory": "string",
        "needsWork": "string"
      }
    ]
  }
}

### CRITICAL INSTRUCTIONS:

**Content Depth Guidelines:**
- "deepDive": 250-400 words of substantive explanation
- "lineByLineAnalysis": Analyze EVERY significant line/step
- "detailedExplanation": 100-150 words explaining the reasoning

**Universal Adaptability:**
- **Programming/Tech**: Use "codeOrFormula.content" for actual code with language specification
- **Culinary Arts**: Use it for recipes with ingredients and techniques
- **Mathematics/Science**: Use it for formulas, proofs, or experimental procedures  
- **Languages**: Use it for grammar rules, sentence structures, or dialogues
- **Arts/Music**: Use it for notation, compositions, or technique descriptions
- **Business/Soft Skills**: Use it for frameworks, templates, or process diagrams

**Quality Standards:**
1. NO placeholders - every field must have complete, actionable content
2. NO vague language - be specific and technical
3. Balance theory with practice - every concept gets a hands-on application
4. Progressive complexity - each day builds on previous knowledge
5. Design for mastery, not completion - depth over breadth

**Realistic Scoping:**
- If the module requires more time than "${availableTime}" for true mastery, extend the "totalDays" accordingly
- Each daily lesson should be completable in one focused session
- Include buffer time for review and practice

**Output Format:**
Return ONLY the JSON object. No markdown code fences, no preamble, no explanations outside the JSON structure.

Generate a complete, production-ready module that a student could follow independently to achieve mastery.`;
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