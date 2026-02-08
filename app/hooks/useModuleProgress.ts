import { useState, useEffect, useCallback } from "react";

interface ModuleProgressData {
  enrollment: any;
  moduleProgress: any[];
}

export function useModuleProgress(enrollmentId: string | undefined) {
  const [progress, setProgress] = useState<ModuleProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!enrollmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/courses/progress?enrollmentId=${enrollmentId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch progress");
      }

      setProgress(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch progress";
      setError(errorMessage);
      console.error("Progress fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
}