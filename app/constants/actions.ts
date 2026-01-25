// Remove unused import
// import { json } from "stream/consumers";

// Form data interface
export interface FormData {
  subject: string;
  level: string;
  goals: string;
  time: string; // Fixed: removed quotes
  deadline: string;
  style: string;
}

// Module interface
export interface ModuleData {
  moduleNumber: number;
  moduleName: string;
  learningObjectives?: string[];
  masteryRequirements?: any;
  weeklyLearningPlan?: any;
  resources?: any;
  assessmentMethods?: any[];
}

// Course API response
export interface CourseResponse {
  success: boolean;
  course: string; // JSON string
  metadata: {
    subject: string;
    level: string;
    goals: string;
    style: string;
    time: string;
    deadline: string;
    generatedAt: string;
  };
}


export interface LessonParams {
  course: ModuleData & {
    userLevel: string;
    learningStyle: string;
    availableTime: string;
    subject: string;
  };
}


export interface LessonResponse {
  success: boolean;
  lessons: any;
  metadata: {
    moduleName: string;
    moduleNumber: number;
    userLevel: string;
    generatedAt: string;
  };
}

export async function generateCourse(params: FormData) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: params.subject,
      level: params.level,
      goals: params.goals,
      time: params.time,
      style: params.style,
      deadline: params.deadline,
    }),
  });

  const data: CourseResponse = await response.json();
  
  if (data.success) {
    return { data };
  } else {
    console.log('Failed to generate course');
    return null;
  }
}

export async function generateLessons(params: LessonParams) {
  const response = await fetch('/api/lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate lessons');
  }

  return response.json() as Promise<LessonResponse>;
}

export const handleClick = async (formData: FormData) => {
  console.log("Generating course...");
  
  const results = await generateCourse(formData);
  
  if (!results?.data) {
    console.error("Error generating course");
    return null;
  }

  console.log("Course generated successfully:", results);

  let courseModules: ModuleData[];
  try {
    // Fixed: parse results.data.course (not results.data)
    courseModules = JSON.parse(results.data.course);
  } catch (error) {
    console.error("Failed to parse course:", error);
    return null;
  }

  // Find the first module
  const firstModule = courseModules.find((item) => item.moduleNumber === 1);
  
  if (!firstModule) {
    console.error("No modules found");
    return null;
  }

  console.log('First module:', firstModule);
  console.log("Generating lessons for module:", firstModule.moduleName);

  try {
    // Generate lessons with proper structure
    const lessonsResponse = await generateLessons({
      course: {
        ...firstModule, // Spread all module properties
        userLevel: formData.level,
        learningStyle: formData.style,
        availableTime: formData.time,
        subject: formData.subject,
      },
    });

    console.log("Lessons generated:", lessonsResponse);

    return {
      course: courseModules,
      lessons: lessonsResponse.lessons,
      currentModule: firstModule,
      metadata: results.data.metadata,
    };
  } catch (error) {
    console.error("Error generating lessons:", error);
    return null;
  }
};