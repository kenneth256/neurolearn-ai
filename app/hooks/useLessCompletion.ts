import { useState } from 'react';
import toast from 'react-hot-toast';

interface CompleteLessonParams {
  enrollmentId: string;
  lessonModuleId: string;
  timeSpentMinutes: number;
  exercisesCompleted?: number;
  totalExercises?: number;
}

export const useLessonCompletion = () => {
  const [loading, setLoading] = useState(false);

  const completeLesson = async (params: CompleteLessonParams) => {
    setLoading(true);
    const loadingToast = toast.loading('Completing lesson...');

    try {
      const response = await fetch('/api/courses/lesson/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          id: loadingToast,
          duration: 4000,
          icon: data.data.isModuleComplete ? '🎉' : '✅',
        });

        if (data.data.isModuleComplete) {
          setTimeout(() => {
            toast.success('Next module unlocked! Keep going! 🚀', {
              duration: 3000,
            });
          }, 500);
        }
        console.log('complete', data)
        return data;
      } else {
        toast.error(data.message || 'Failed to complete lesson', {
          id: loadingToast,
        });
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.', {
        id: loadingToast,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { completeLesson, loading };
};