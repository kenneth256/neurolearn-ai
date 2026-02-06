import { ModuleProgressResponse } from "./progress";

export interface CourseModuleData {
  id: number;
  moduleNumber: number;
  moduleName: string;
  totalDuration?: string;
  dailyLessons?: any[]; 
}

export interface EnrollmentDashboard {
  id: number;
  course: {
    id: number;
    title: string;
    description?: string;
    modules: CourseModuleData[];
  };
  progress: ModuleProgressResponse[];
  enrolledAt: string;
}

export interface DashboardResponse {
  enrollments: EnrollmentDashboard[];
}
