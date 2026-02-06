import { ProjectData } from "../components/ui/protocol";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  preLessonCheck?: any;
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
  assessmentBlueprint?: any;
  differentiatedLearning?: {
    forBeginners?: string;
    forAdvanced?: string;
  };
  weeklyMilestones?: string[];
  [key: number]: {
    dailyLessons: DailyLesson[];
    moduleCapstone?: ProjectData;
    differentiatedLearning?: {
      forBeginners?: string;
      forAdvanced?: string;
    };
    weeklyMilestones?: string[];
    assessmentBlueprint?: any;
  };
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
You are an expert instructional designer and learning strategist with deep knowledge of mastery-based learning.

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
    "learningObjectives": ["Specific objective 1", "Specific objective 2", "Specific objective 3"],
    "masteryRequirements": {
      "threshold": "90%",
      "criteria": ["Specific criterion 1", "Specific criterion 2"]
    },
    "assessmentMethods": [
      {"type": "Coding Challenge", "description": "Detailed description of the assessment"}
    ],
    "weeklyLearningPlan": {
      "totalHours": 15,
      "dailyBreakdown": {
        "Mon-Fri": "2 hours (1h theory, 1h practice)",
        "Sat-Sun": "2.5 hours (project work)"
      },
      "reviewCycle": "Spaced Repetition: Day 1, 3, 7, 14, 30",
      "tasks": ["Specific task 1", "Specific task 2"]
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
- Provide enough information to fully master the topic
`;

export interface LessonDesignParams {
  module: CourseModule;  
  userLevel: string;
  learningStyle: string;
  availableTime: string;
}


export const lessonDesignPrompt = ({ module, userLevel, learningStyle, availableTime }: LessonDesignParams): string => {
  const moduleData = JSON.stringify(module, null, 2);
  
  return `You are a world-class Instructional Designer. Your task is to generate a **Full, Interactive Course Module**. 

### THE "NO-BOOK" RULE:
Every concept must be paired with:
1. **The "Why"**: A real-world scenario where this concept solves a problem.
2. **Active Inquiry**: Socratic questions mid-explanation.
3. **The "Gotcha"**: A non-obvious edge case or common misconception.
4. **Mastery Focus**: Information must be exhaustive to ensure 100% understanding, even if it exceeds the suggested time.

### Student Profile:
- Expertise: ${userLevel}
- Style: ${learningStyle}
- Time: ${availableTime}

### Source Material:
${moduleData}

### MANDATORY JSON STRUCTURE:
Return a JSON object where the root key is "${module.moduleNumber}". 

{
  "${module.moduleNumber}": {
    "moduleTitle": "${module.moduleName}",
    "moduleNumber": ${module.moduleNumber},
    "totalDuration": "Estimated total time for this module",
    "dailyLessons": [
      {
        "day": 1,
        "title": "Day Theme Title",
        "duration": "${availableTime}",
        "learningObjectives": [
          {
            "objective": "What they'll learn",
            "measurable": "How success is measured",
            "timebound": "Time to achieve"
          }
        ],
        "coreContent": {
          "concepts": [
            {
              "title": "Concept Title",
              "narrativeExplanation": "Multi-paragraph deep dive tutorial with examples.",
              "interactiveAnalogy": "A relatable metaphor or analogy to explain the concept.",
              "codeWalkthrough": {
                "code": "Practical example - could be: programming code, historical case study, recipe steps, mathematical proof, business scenario, etc.",
                "analysis": "Step-by-step breakdown explaining each part in detail.",
                "language": "For programming: 'python', 'javascript', etc. For other subjects: 'text', 'steps', 'math', 'case-study', 'markdown'"
              },
              "edgeCase": "Non-obvious gotcha, common mistake, or important caveat students often miss."
            }
          ]
        },
        "handsOnPractice": {
          "exercises": [
            {
              "title": "Exercise name",
              "challenge": "What they need to accomplish",
              "constraints": ["Constraint 1", "Constraint 2"],
              "starterCode": "Optional starter template if applicable",
              "hints": ["Hint 1", "Hint 2"],
              "fullSolution": "Complete solution with all steps",
              "explanationOfSolution": "Detailed explanation of why this solution works"
            }
          ]
        },
        "knowledgeChecks": {
          "questions": [
            {
              "type": "multiple-choice",
              "question": "Logic-based question that tests deep understanding, not just memorization",
              "options": [
                "First option text",
                "Second option text",
                "Third option text",
                "Fourth option text"
              ],
              "correctAnswer": "Exact text matching ONE of the options above",
              "feedback": "Comprehensive explanation of why this is correct and why other options are wrong"
            }
          ]
        },
        "commonPitfalls": [
          {
            "mistake": "Common mistake students make",
            "mentalModelFix": "Better way to conceptualize this topic",
            "debuggingHack": "Practical tip to avoid or identify this mistake"
          }
        ]
      }
    ],
    "weeklyMilestones": [
      "Milestone 1: What they should achieve by end of week 1",
      "Milestone 2: What they should achieve by end of week 2"
    ],
    "differentiatedLearning": {
      "forBeginners": "Simplified explanations or additional scaffolding for those struggling",
      "forAdvanced": "Challenge extensions, deeper theory, or optimization techniques"
    },
    "assessmentBlueprint": {
      "finalProject": {
        "prompt": "Comprehensive capstone project that synthesizes all module concepts",
        "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
        "rubric": ["Criterion 1: Description (40%)", "Criterion 2: Description (30%)", "Criterion 3: Description (30%)"]
      }
    }
  }
}

CRITICAL RULES FOR GENERATION:
1. **Randomize Quiz Answers**: Place the correct answer at RANDOM positions across questions. DO NOT put correct answers at index 0 every time. Mix them up (index 0, 1, 2, or 3).
2. **Match correctAnswer Exactly**: The "correctAnswer" field must contain the EXACT text of one option from the "options" array. Copy-paste it precisely.
3. **Subject-Appropriate Content in codeWalkthrough.code**: 
   - Programming courses: Actual executable code
   - History courses: Historical case study text
   - Business courses: Business scenario/case
   - Cooking courses: Recipe with steps
   - Math courses: Worked mathematical problem
   - Set "language" accordingly: code languages OR content types like "text", "steps", "markdown"
4. **Escape JSON properly**: All quotes, newlines, and special characters must be properly escaped.
5. **Depth over brevity**: Provide comprehensive, production-quality content. Better to exceed time than leave gaps in understanding.
6. **Root key must be "${module.moduleNumber}"** - this is mandatory for parsing.
7. **Return ONLY valid JSON** - no markdown blocks, no extra commentary, just the JSON object.

Return ONLY the JSON object, nothing else.`;
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