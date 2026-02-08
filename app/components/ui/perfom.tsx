// src/components/analytics/EnhancedAnalyticsDashboard.tsx
"use client";

import React, { useState, useMemo } from "react";
import { usePerformanceDashboard } from "@/app/hooks/useAnalyseHook";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";
import {
  EnrollmentAnalytics,
  MoodDistribution,
  PerformanceDashboard,
} from "@/app/api/lib/analytics/analytics";

interface PerformanceDashboardProps {
  userId: string;
}

export function EnhancedAnalyticsDashboard({
  userId,
}: PerformanceDashboardProps) {
  const { data, loading, error, refetch } = usePerformanceDashboard(userId);
  const [activeView, setActiveView] = useState<
    "overview" | "courses" | "insights"
  >("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-amber-100 dark:border-amber-950/50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-serif text-slate-900 dark:text-slate-100">
            Loading your analytics folio...
          </p>
          <p className="text-xs font-mono uppercase tracking-widest text-amber-600 mt-2">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="bg-card-bg rounded-2xl shadow-[8px_8px_0px_0px_rgba(245,158,11,0.1)] p-12 max-w-md w-full border-2 border-red-200 dark:border-red-900/30">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-red-200 dark:border-red-900/30">
            <span className="text-4xl">⚠</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 text-center mb-3">
            Unable to Access Records
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-8 font-serif italic">
            {error}
          </p>
          <button
            onClick={refetch}
            className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl transition-all font-serif font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] text-lg"
          >
            Retry Access
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center rounded-2xl p-16 border-2 border-amber-200 dark:border-amber-900/30 bg-card-bg shadow-[8px_8px_0px_0px_rgba(245,158,11,0.1)]">
          <div className="text-8xl mb-6">📚</div>
          <p className="text-2xl font-serif text-slate-900 dark:text-slate-100 mb-2">
            No Records Found
          </p>
          <p className="text-sm font-mono uppercase tracking-widest text-amber-600">
            Begin your learning journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card-bg border-b-2 border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-lg bg-card-bg/95">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    Analytics Folio
                  </h1>
                  <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600">
                    Performance Chronicle
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              {(["overview", "courses", "insights"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-6 py-3 rounded-lg font-serif font-bold transition-all ${
                    activeView === view
                      ? "bg-amber-500 text-slate-900 border-2 border-amber-600"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-sm uppercase tracking-wider">
                    {view}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {activeView === "overview" && <OverviewSection data={data} />}
        {activeView === "courses" && (
          <CoursesSection enrollments={data.enrollments} />
        )}
        {activeView === "insights" && <InsightsSection data={data} />}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW SECTION
// ============================================

function OverviewSection({ data }: { data: PerformanceDashboard }) {
  const { overallStats, enrollments } = data;

  const statsCards = [
    {
      label: "Courses Enrolled",
      value: overallStats.totalCoursesEnrolled,
      icon: "📚",
      color: "amber",
      description: "Active registrations",
    },
    {
      label: "Completed",
      value: overallStats.totalCoursesCompleted,
      icon: "✅",
      color: "green",
      description: "Finished courses",
    },
    {
      label: "Study Hours",
      value: `${Math.round(overallStats.totalTimeSpent / 60)}`,
      icon: "⏰",
      color: "purple",
      description: "Time invested",
    },
    {
      label: "Avg Mastery",
      value: `${Math.round(overallStats.averageMasteryScore)}%`,
      icon: "🎯",
      color: "orange",
      description: "Overall proficiency",
    },
  ];

  const progressData = useMemo(() => {
    const completed = enrollments.filter(
      (e) => e.status === "COMPLETED",
    ).length;
    const inProgress = enrollments.filter(
      (e) => e.status === "IN_PROGRESS" || e.status === "ACTIVE",
    ).length;
    const notStarted = enrollments.filter(
      (e: EnrollmentAnalytics) => e.status === "NOT_STARTED",
    ).length;

    return [
      { name: "Completed", value: completed, color: "#10b981" },
      { name: "In Progress", value: inProgress, color: "#f59e0b" },
      { name: "Not Started", value: notStarted, color: "#94a3b8" },
    ];
  }, [enrollments]);

  const masteryData = useMemo(() => {
    return enrollments
      .filter((e) => e.averageMasteryScore > 0)
      .map((e) => ({
        course: e.courseTitle.substring(0, 20) + "...",
        mastery: Math.round(e.averageMasteryScore),
        completion: Math.round(e.overallCompletion),
      }))
      .slice(0, 8);
  }, [enrollments]);

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { name, value } = props;
    return `${name}: ${value}`;
  };

  return (
    <div className="space-y-12">
      {/* Decorative Header */}
      <div className="text-center mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-700">
        <span className="text-xs font-mono uppercase tracking-[0.4em] text-amber-600 block mb-2">
          Learning Overview
        </span>
        <h2 className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Your Academic Record
        </h2>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-card-bg rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 group hover:border-amber-500 dark:hover:border-amber-600 hover:-translate-x-[4px] hover:-translate-y-[4px]"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className={`w-16 h-16 rounded-2xl ${
                  stat.color === "amber"
                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500"
                    : stat.color === "green"
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                      : stat.color === "purple"
                        ? "bg-purple-50 dark:bg-purple-950/20 border-purple-500"
                        : "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
                } border-2 flex items-center justify-center`}
              >
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">
                {stat.label}
              </div>
              <div className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100">
                {stat.value}
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 font-serif italic border-t-2 border-slate-100 dark:border-slate-800 pt-3 mt-3">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
            <span className="text-3xl">📖</span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Learning Milestones
            </h3>
          </div>
          <div className="space-y-4">
            <MilestoneItem
              icon="📚"
              label="Modules Completed"
              value={overallStats.totalModulesCompleted}
            />
            <MilestoneItem
              icon="📝"
              label="Lessons Completed"
              value={overallStats.totalLessonsCompleted}
            />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-8 border-2 border-amber-500 shadow-[8px_8px_0px_0px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-amber-200 dark:border-amber-900/50">
            <span className="text-3xl">🔥</span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-amber-100">
              Streak Achievements
            </h3>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-amber-600">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                Current Streak
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-serif font-bold text-amber-600">
                  {overallStats.currentStreak}
                </span>
                <span className="text-2xl font-serif text-slate-600 dark:text-slate-400">
                  days
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border-2 border-orange-500">
              <div className="text-xs font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">
                Longest Streak
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-orange-600">
                  {overallStats.longestStreak}
                </span>
                <span className="text-xl font-serif text-slate-600 dark:text-slate-400">
                  days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
              Distribution
            </span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Course Progress
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#fff"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontFamily: "serif",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
              Analysis
            </span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Mastery vs Completion
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="course"
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontFamily: "serif",
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: "serif" }} />
                <Bar
                  dataKey="mastery"
                  fill="#f59e0b"
                  name="Mastery %"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="completion"
                  fill="#10b981"
                  name="Completion %"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-600 transition-all">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-slate-700 dark:text-slate-300 font-serif font-medium text-lg">
          {label}
        </span>
      </div>
      <span className="text-4xl font-serif font-bold text-amber-600">
        {value}
      </span>
    </div>
  );
}

// ============================================
// COURSES SECTION
// ============================================

function CoursesSection({
  enrollments,
}: {
  enrollments: EnrollmentAnalytics[];
}) {
  const [selectedCourse, setSelectedCourse] =
    useState<EnrollmentAnalytics | null>(null);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-700">
        <span className="text-xs font-mono uppercase tracking-[0.4em] text-amber-600 block mb-2">
          Course Library
        </span>
        <h2 className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Your Enrolled Courses
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <EnhancedCourseCard
            key={enrollment.enrollmentId}
            enrollment={enrollment}
            onClick={() => setSelectedCourse(enrollment)}
          />
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          enrollment={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}

function EnhancedCourseCard({
  enrollment,
  onClick,
}: {
  enrollment: EnrollmentAnalytics;
  onClick: () => void;
}) {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "low":
        return {
          bg: "bg-green-50 dark:bg-green-950/20",
          text: "text-green-800 dark:text-green-400",
          border: "border-green-500",
        };
      case "medium":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-800 dark:text-amber-400",
          border: "border-amber-500",
        };
      case "high":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/20",
          text: "text-orange-800 dark:text-orange-400",
          border: "border-orange-500",
        };
      case "critical":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          text: "text-red-800 dark:text-red-400",
          border: "border-red-500",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950/20",
          text: "text-gray-800 dark:text-gray-400",
          border: "border-gray-500",
        };
    }
  };

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      ENGAGED: "😊",
      EXCITED: "🤩",
      NEUTRAL: "😐",
      BORED: "😴",
      CONFUSED: "😕",
      FRUSTRATED: "😤",
      OVERWHELMED: "😰",
    };
    return moodEmojis[mood || ""] || "😐";
  };

  const riskConfig = getRiskConfig(enrollment.riskLevel);

  return (
    <div
      onClick={onClick}
      className="bg-card-bg rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer group hover:border-amber-500 dark:hover:border-amber-600 hover:-translate-x-[4px] hover:-translate-y-[4px]"
    >
      {/* Decorative Header */}
      <div className="h-24 bg-amber-100 dark:bg-amber-950/30 relative border-b-2 border-slate-200 dark:border-slate-800">
        <div className="absolute top-4 right-4">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold ${riskConfig.bg} ${riskConfig.text} border-2 ${riskConfig.border}`}
          >
            {enrollment.riskLevel}
          </span>
        </div>

        <div className="absolute bottom-4 left-6">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">
            Course Record
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Course Title */}
        <h3 className="font-serif font-bold text-2xl mb-4 text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
          {enrollment.courseTitle}
        </h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-600 dark:text-slate-400 font-serif font-medium">
              Overall Progress
            </span>
            <span className="font-mono font-bold text-amber-600 text-lg">
              {Math.round(enrollment.overallCompletion)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
            <div
              className="bg-amber-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${enrollment.overallCompletion}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBadge
            label="Modules"
            value={`${enrollment.modulesCompleted}/${enrollment.totalModules}`}
            icon="📚"
          />
          <StatBadge
            label="Lessons"
            value={`${enrollment.lessonsCompleted}/${enrollment.totalLessons}`}
            icon="📝"
          />
          <StatBadge
            label="Mastery"
            value={`${Math.round(enrollment.averageMasteryScore)}%`}
            icon="🎯"
          />
          <StatBadge
            label="Time"
            value={`${Math.round(enrollment.totalTimeSpent / 60)}h`}
            icon="⏰"
          />
        </div>

        {/* Mood & Streak */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100 dark:border-slate-800">
          {enrollment.averageMood && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {getMoodEmoji(enrollment.averageMood.dominantMood)}
              </span>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mood
                </div>
                <div className="text-sm font-serif capitalize text-slate-700 dark:text-slate-300">
                  {enrollment.averageMood.dominantMood.toLowerCase()}
                </div>
              </div>
            </div>
          )}
          {enrollment.currentStreak > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-4 py-2 rounded-xl border-2 border-orange-500">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Streak
                </div>
                <div className="text-lg font-serif font-bold text-orange-600">
                  {enrollment.currentStreak}d
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-600 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

// ============================================
// COURSE DETAIL MODAL
// ============================================

function CourseDetailModal({
  enrollment,
  onClose,
}: {
  enrollment: EnrollmentAnalytics;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-amber-100 dark:bg-amber-950/30 p-8 rounded-t-2xl border-b-2 border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400 block mb-2">
                Course Ledger
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">
                {enrollment.courseTitle}
              </h2>
              <p className="text-sm font-serif italic text-slate-600 dark:text-slate-400">
                Detailed Analytics & Performance Record
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl p-3 transition-colors border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
            >
              <span className="text-3xl font-serif">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Completion"
              value={`${Math.round(enrollment.overallCompletion)}%`}
              icon="📊"
              color="amber"
            />
            <MetricCard
              title="Mastery Score"
              value={`${Math.round(enrollment.averageMasteryScore)}%`}
              icon="🎯"
              color="green"
            />
            <MetricCard
              title="Time Invested"
              value={`${Math.round(enrollment.totalTimeSpent / 60)}h`}
              icon="⏰"
              color="purple"
            />
          </div>

          {/* Mood Analysis */}
          {enrollment.averageMood && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
              <div className="mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
                  Emotional State
                </span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  Mood Analysis
                </h3>
              </div>
              <MoodChart
                moodData={enrollment.averageMood.moodDistribution || []}
              />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
            <div className="mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
                Chronicle
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                Timeline
              </h3>
            </div>
            <div className="space-y-4">
              <TimelineItem
                label="Enrolled"
                date={new Date(enrollment.enrolledAt)}
                icon="📅"
              />
              <TimelineItem
                label="Last Accessed"
                date={new Date(enrollment.lastAccessedAt)}
                icon="👁️"
              />
              {enrollment.estimatedCompletionDate && (
                <TimelineItem
                  label="Est. Completion"
                  date={new Date(enrollment.estimatedCompletionDate)}
                  icon="🎓"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: "amber" | "green" | "purple";
}) {
  const colorClasses = {
    amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-500",
    green: "bg-green-50 dark:bg-green-950/20 border-green-500",
    purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-500",
  };

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-6 border-2`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
          {title}
        </span>
      </div>
      <div className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  icon,
}: {
  label: string;
  date: Date;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-600 transition-all">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="text-base font-serif font-semibold text-slate-900 dark:text-slate-100">
          {date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}

function MoodChart({ moodData }: { moodData: MoodDistribution[] }) {
  if (!moodData || moodData.length === 0) {
    return (
      <p className="text-slate-600 dark:text-slate-400 font-serif italic text-center py-8">
        No mood data available
      </p>
    );
  }

  const chartData = moodData.map((m) => ({
    mood: m.mood,
    count: m.count,
    percentage: m.percentage,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="mood" tick={{ fontSize: 12, fontFamily: "serif" }} />
          <YAxis tick={{ fontFamily: "monospace" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              fontFamily: "serif",
            }}
          />
          <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// INSIGHTS SECTION
// ============================================

function InsightsSection({ data }: { data: PerformanceDashboard }) {
  const { enrollments, overallStats } = data;

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED",
  ).length;
  const avgCompletion =
    enrollments.reduce((sum, e) => sum + e.overallCompletion, 0) / totalCourses;

  const riskData = [
    {
      name: "Low",
      count: enrollments.filter((e) => e.riskLevel === "low").length,
      color: "#10b981",
    },
    {
      name: "Medium",
      count: enrollments.filter((e) => e.riskLevel === "medium").length,
      color: "#f59e0b",
    },
    {
      name: "High",
      count: enrollments.filter((e) => e.riskLevel === "high").length,
      color: "#f97316",
    },
    {
      name: "Critical",
      count: enrollments.filter((e) => e.riskLevel === "critical").length,
      color: "#ef4444",
    },
  ].filter((r) => r.count > 0);

  const timeData = enrollments
    .map((e) => ({
      course: e.courseTitle.substring(0, 15) + "...",
      hours: Math.round(e.totalTimeSpent / 60),
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 6);

  const renderRiskLabel = (props: PieLabelRenderProps) => {
    return `${props.name}: ${props.value}`;
  };

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-700">
        <span className="text-xs font-mono uppercase tracking-[0.4em] text-amber-600 block mb-2">
          Deep Analysis
        </span>
        <h2 className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100">
          Learning Insights
        </h2>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          title="Completion Rate"
          value={`${Math.round((completedCourses / totalCourses) * 100)}%`}
          description={`${completedCourses} of ${totalCourses} courses completed`}
          icon="🎯"
          trend="positive"
        />
        <InsightCard
          title="Avg Progress"
          value={`${Math.round(avgCompletion)}%`}
          description="Across all active courses"
          icon="📈"
          trend="positive"
        />
        <InsightCard
          title="Study Consistency"
          value={`${overallStats.currentStreak} days`}
          description={`Longest: ${overallStats.longestStreak} days`}
          icon="🔥"
          trend={
            overallStats.currentStreak >= overallStats.longestStreak / 2
              ? "positive"
              : "neutral"
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
              Assessment
            </span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Risk Level Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderRiskLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  strokeWidth={3}
                  stroke="#fff"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontFamily: "serif",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
              Investment
            </span>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Study Time by Course
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontFamily: "monospace" }} />
                <YAxis
                  dataKey="course"
                  type="category"
                  width={120}
                  tick={{ fontSize: 11, fontFamily: "serif" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontFamily: "serif",
                  }}
                />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="mb-8 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 block mb-2">
            Guidance
          </span>
          <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
            Personalized Recommendations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Keep Your Streak Alive"
            description="You're on a great streak! Try to study a little each day to maintain momentum."
            icon="🔥"
            priority="high"
          />
          {enrollments.some(
            (e) => e.riskLevel === "high" || e.riskLevel === "critical",
          ) && (
            <RecommendationCard
              title="Focus on At-Risk Courses"
              description="Some courses need attention. Review your struggling areas and set realistic goals."
              icon="⚠️"
              priority="high"
            />
          )}
          {avgCompletion > 75 && (
            <RecommendationCard
              title="Great Progress!"
              description="You're making excellent progress. Consider exploring advanced topics."
              icon="🌟"
              priority="medium"
            />
          )}
          <RecommendationCard
            title="Optimize Study Time"
            description="Identify your most productive hours and schedule study sessions accordingly."
            icon="⏰"
            priority="medium"
          />
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  trend: "positive" | "negative" | "neutral";
}) {
  const trendConfig = {
    positive: {
      icon: "📈",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-500",
    },
    negative: {
      icon: "📉",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-500",
    },
    neutral: {
      icon: "➡️",
      bg: "bg-slate-50 dark:bg-slate-900",
      border: "border-slate-500",
    },
  };

  const config = trendConfig[trend];

  return (
    <div className="bg-card-bg rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:border-amber-500 dark:hover:border-amber-600 transition-all hover:-translate-x-[4px] hover:-translate-y-[4px]">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center border-2 border-amber-500">
          <span className="text-3xl">{icon}</span>
        </div>
        <div
          className={`px-3 py-1 rounded-xl ${config.bg} border-2 ${config.border}`}
        >
          <span className="text-sm font-serif font-semibold">
            {config.icon}
          </span>
        </div>
      </div>
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </div>
      <div className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-3">
        {value}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 font-serif italic border-t-2 border-slate-100 dark:border-slate-800 pt-3">
        {description}
      </div>
    </div>
  );
}

function RecommendationCard({
  title,
  description,
  icon,
  priority,
}: {
  title: string;
  description: string;
  icon: string;
  priority: "high" | "medium" | "low";
}) {
  const priorityConfig = {
    high: "border-red-500 bg-red-50 dark:bg-red-950/20",
    medium: "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
    low: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
  };

  return (
    <div
      className={`rounded-xl p-6 border-2 ${priorityConfig[priority]} hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <h4 className="font-serif font-semibold text-slate-900 dark:text-slate-100 mb-2 text-lg">
            {title}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-serif">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnhancedAnalyticsDashboard;
