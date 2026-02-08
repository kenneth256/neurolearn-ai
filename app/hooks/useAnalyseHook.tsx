import { useState, useEffect } from 'react';
import {
  PerformanceDashboard,
  LearningVelocity,
  EnrollmentAnalytics,
  StruggleAnalysis,
  MoodImpactAnalysis,
  MasteryProgression,
  AdaptiveQuizAnalytics,
  CompletionPrediction,
  SpacedRepetitionAnalytics,
  AnalyticsResponse
} from '../api/lib/analytics/analytics'

interface UseAnalyticsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

function useAnalytics<T>(
  endpoint: string,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(endpoint);
      const result: AnalyticsResponse<T> = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, enabled, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function usePerformanceDashboard(
  userId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<PerformanceDashboard>(
    `/api/analytics/performance/dashboard?userId=${userId}`,
    { ...options, enabled: !!userId && (options?.enabled ?? true) }
  );
}

export function useLearningVelocity(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<LearningVelocity>(
    `/api/analytics/performance/velocity?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useEnrollmentSummary(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<EnrollmentAnalytics>(
    `/api/analytics/performance/enrollment?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useStruggleAnalysis(
  userId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<StruggleAnalysis>(
    `/api/analytics/struggle?userId=${userId}`,
    { ...options, enabled: !!userId && (options?.enabled ?? true) }
  );
}

export function useMoodImpact(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<MoodImpactAnalysis>(
    `/api/analytics/mood?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useMasteryProgression(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<MasteryProgression>(
    `/api/analytics/mastery/progression?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useAdaptiveQuizAnalytics(
  userId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<AdaptiveQuizAnalytics>(
    `/api/analytics/mastery/quiz?userId=${userId}`,
    { ...options, enabled: !!userId && (options?.enabled ?? true) }
  );
}

export function useCompletionPrediction(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<CompletionPrediction>(
    `/api/analytics/prediction/completion?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useSpacedRepetition(
  enrollmentId: string | null,
  options?: UseAnalyticsOptions
) {
  return useAnalytics<SpacedRepetitionAnalytics>(
    `/api/analytics/prediction/spaced-repetition?enrollmentId=${enrollmentId}`,
    { ...options, enabled: !!enrollmentId && (options?.enabled ?? true) }
  );
}

export function useFullEnrollmentAnalytics(enrollmentId: string | null) {
  const enrollment = useEnrollmentSummary(enrollmentId);
  const velocity = useLearningVelocity(enrollmentId);
  const mood = useMoodImpact(enrollmentId);
  const mastery = useMasteryProgression(enrollmentId);
  const prediction = useCompletionPrediction(enrollmentId);
  const repetition = useSpacedRepetition(enrollmentId);

  return {
    enrollment,
    velocity,
    mood,
    mastery,
    prediction,
    repetition,
    loading: [enrollment, velocity, mood, mastery, prediction, repetition].some(
      (hook) => hook.loading
    ),
    error: [enrollment, velocity, mood, mastery, prediction, repetition]
      .map((hook) => hook.error)
      .filter(Boolean)[0],
    refetchAll: () => {
      enrollment.refetch();
      velocity.refetch();
      mood.refetch();
      mastery.refetch();
      prediction.refetch();
      repetition.refetch();
    }
  };
}

export function useFullUserAnalytics(userId: string | null) {
  const dashboard = usePerformanceDashboard(userId);
  const struggle = useStruggleAnalysis(userId);
  const quiz = useAdaptiveQuizAnalytics(userId);

  return {
    dashboard,
    struggle,
    quiz,
    loading: [dashboard, struggle, quiz].some((hook) => hook.loading),
    error: [dashboard, struggle, quiz]
      .map((hook) => hook.error)
      .filter(Boolean)[0],
    refetchAll: () => {
      dashboard.refetch();
      struggle.refetch();
      quiz.refetch();
    }
  };
}

export const AnalyticsHooks = {
  usePerformanceDashboard,
  useLearningVelocity,
  useEnrollmentSummary,
  useStruggleAnalysis,
  useMoodImpact,
}
