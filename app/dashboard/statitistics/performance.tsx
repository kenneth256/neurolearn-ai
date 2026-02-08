"use client";

import { EnrollmentAnalytics, PerformanceDashboard } from "@/app/api/lib/analytics/analytics";
import { usePerformanceDashboard } from "@/app/hooks/useAnalyseHook";
import React from "react";

interface PerformanceDashboardProps {
  userId: string;
}

export function PerformanceDashboardComponent({
  userId,
}: PerformanceDashboardProps) {
  const { data, loading, error, refetch } = usePerformanceDashboard(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading analytics: {error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Learning Overview</h2>
        <OverallStatsCards stats={data.overallStats} />
      </div>

      {/* Active Enrollments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.enrollmentId}
              enrollment={enrollment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverallStatsCards({
  stats,
}: {
  stats: PerformanceDashboard["overallStats"];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Courses Enrolled"
        value={stats.totalCoursesEnrolled}
        icon="📚"
      />
      <StatCard
        label="Courses Completed"
        value={stats.totalCoursesCompleted}
        icon="✅"
      />
      <StatCard
        label="Study Time"
        value={`${Math.round(stats.totalTimeSpent / 60)}h`}
        icon="⏰"
      />
      <StatCard
        label="Avg Mastery"
        value={`${Math.round(stats.averageMasteryScore)}%`}
        icon="🎯"
      />
      <StatCard
        label="Modules Completed"
        value={stats.totalModulesCompleted}
        icon="📖"
      />
      <StatCard
        label="Lessons Completed"
        value={stats.totalLessonsCompleted}
        icon="📝"
      />
      <StatCard
        label="Current Streak"
        value={`${stats.currentStreak} days`}
        icon="🔥"
      />
      <StatCard
        label="Longest Streak"
        value={`${stats.longestStreak} days`}
        icon="🏆"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// ============================================
// ENROLLMENT CARD
// ============================================

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentAnalytics }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return "😐";
    const moodEmojis: Record<string, string> = {
      ENGAGED: "😊",
      EXCITED: "🤩",
      NEUTRAL: "😐",
      BORED: "😴",
      CONFUSED: "😕",
      FRUSTRATED: "😤",
      OVERWHELMED: "😰",
    };
    return moodEmojis[mood] || "😐";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Course Title */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
        {enrollment.courseTitle}
      </h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold">
            {Math.round(enrollment.overallCompletion)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${enrollment.overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <p className="text-gray-600">Modules</p>
          <p className="font-semibold">
            {enrollment.modulesCompleted}/{enrollment.totalModules}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Lessons</p>
          <p className="font-semibold">
            {enrollment.lessonsCompleted}/{enrollment.totalLessons}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Mastery</p>
          <p className="font-semibold">
            {Math.round(enrollment.averageMasteryScore)}%
          </p>
        </div>
        <div>
          <p className="text-gray-600">Time</p>
          <p className="font-semibold">
            {Math.round(enrollment.totalTimeSpent / 60)}h
          </p>
        </div>
      </div>

      {/* Mood & Risk */}
      <div className="flex items-center justify-between mb-3">
        {enrollment.averageMood && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getMoodEmoji(enrollment.averageMood.dominantMood)}
            </span>
            <span className="text-sm text-gray-600">
              {enrollment.averageMood.recentTrend}
            </span>
          </div>
        )}
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(enrollment.riskLevel)}`}
        >
          {enrollment.riskLevel} risk
        </span>
      </div>

      {/* Streak */}
      {enrollment.currentStreak > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span>🔥</span>
          <span className="text-gray-600">
            {enrollment.currentStreak} day streak
          </span>
        </div>
      )}

    
      {enrollment.estimatedCompletionDate && (
        <div className="mt-2 pt-2 border-t text-sm text-gray-600">
          Est. completion:{" "}
          {new Date(enrollment.estimatedCompletionDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default PerformanceDashboardComponent;
