import { create } from 'zustand';

export interface CourseData {
  title: string;
  lessons: any[];
  theme: string;
}

interface AppState {
  course: CourseData | null;
  currentFileContent: string;
  setCourse: (course: CourseData) => void;
  addLesson: (lesson: any) => void;
  updateFile: (content: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  course: null,
  currentFileContent: "",
  setCourse: (course) => set({ course }),
  addLesson: (lesson) => set((state) => ({
    course: state.course ? { ...state.course, lessons: [...state.course.lessons, lesson] } : null
  })),
  updateFile: (content) => set({ currentFileContent: content }),
}));