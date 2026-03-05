"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { ThemeToggle } from "../components/ui/theme";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Loader2,
  PlusCircle,
  Library,
  BarChart3,
  Home,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../api/lib/auth/getUser";
import { EnhancedAnalyticsDashboard } from "../components/ui/perfom";
import { apiClient } from "../api/lib/client.ts/client";
import { DailyReviewWidget } from "../components/dashboard/DailyReviewWidget";

interface Course {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  level: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
  stats: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    notStartedModules: number;
    progressPercentage: number;
    totalEnrollments: number;
  };
  modules: any[];
}

/* ── Reusable course card ──────────────────────────────────────────────── */
const CourseCard = ({
  course,
  onEnroll,
}: {
  course: Course;
  onEnroll?: (id: string) => Promise<void>;
}) => {
  const enrolled = course.isEnrolled; // ✅ use the explicit flag
  return (
    <div key={course.id}>
      {enrolled ? (
        <Link href={`/courses/${course.id}`}>
          <motion.div
            whileHover={{ x: 8 }}
            className="bg-white dark:bg-[var(--card)] p-8 rounded-2xl border border-slate-200 dark:border-[var(--card-border)] shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-6 flex-1">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-md">
                <PlayCircle size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {course.subject}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {course.level}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {course.stats?.totalModules || 0} modules
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-[280px] h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full bg-amber-500 transition-all duration-1000"
                      style={{ width: `${course.stats?.progressPercentage || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-400">
                    {course.stats?.progressPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight
              className="text-slate-300 dark:text-slate-700 group-hover:text-amber-500 transition-colors"
              size={28}
            />
          </motion.div>
        </Link>
      ) : (
        <motion.div
          whileHover={{ x: 8 }}
          className="bg-white dark:bg-[var(--card)] p-8 rounded-2xl border border-slate-200 dark:border-[var(--card-border)] shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-md">
              <PlayCircle size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mb-2">
                {course.title}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {course.subject}
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {course.level}
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {course.stats?.totalModules || 0} modules
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-serif italic">
                Not enrolled yet
              </p>
            </div>
          </div>
          {onEnroll && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                await onEnroll(course.id);
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-serif font-bold transition-all"
            >
              Enroll Now
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

/* ── Empty state ───────────────────────────────────────────────────────── */
const EmptyState = ({
  message,
  cta,
}: {
  message: string;
  cta?: React.ReactNode;
}) => (
  <div className="text-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border-2 border-dashed border-slate-300 dark:border-[var(--border)]">
    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <BookOpen className="text-amber-500" size={40} />
    </div>
    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">
      {message}
    </h3>
    {cta}
  </div>
);

/* ── Dashboard ─────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const hasFetched = useRef(false);
  const router = useRouter();

  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchMyCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const response = await fetch("/api/courses/getCourse", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        });

        if (response.status === 401) {
          setError("Authentication required. Please log in.");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setMyCourses(data.courses || []);
        } else {
          setError(data.error || "Failed to load courses");
        }
      } catch {
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  /* ── Derived stats ─────────────────────────────────────────────────── */
  const enrolledCourses = myCourses.filter((c) => c.isEnrolled); // ✅ correct flag
  const unenrolledCourses = myCourses.filter((c) => !c.isEnrolled);

  const totalHours = enrolledCourses.reduce(
    (acc, course) => acc + (course.modules?.length || 0) * 2,
    0,
  );

  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
        enrolledCourses.reduce(
          (acc, course) => acc + (course.stats?.progressPercentage || 0),
          0,
        ) / enrolledCourses.length,
      )
      : 0;

  const completedCourses = enrolledCourses.filter(
    (course) => course.stats?.progressPercentage === 100,
  ).length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses.length.toString(),
      icon: BookOpen,
      color: "bg-amber-500",
    },
    {
      label: "Hours Learned",
      value: `${totalHours}h`,
      icon: Clock,
      color: "bg-slate-600",
    },
    {
      label: "Avg. Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "bg-emerald-600",
    },
    {
      label: "Certificates",
      value: completedCourses.toString(),
      icon: Award,
      color: "bg-amber-600",
    },
  ];

  /* ── Enroll handler ────────────────────────────────────────────────── */
  const handleEnroll = async (courseId: string) => {
    try {
      await apiClient.enrollCourse(courseId);
      toast.success("Enrolled successfully!");
      router.refresh(); // ✅ use router.refresh() instead of window.location.reload()
      // Optimistically update local state
      setMyCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c)),
      );
    } catch {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.refresh();
        router.push("/");
      }
    } catch { }
  };

  const navItems = [
    { label: "Dashboard", icon: Home },
    { label: "My Courses", icon: BookOpen },
    { label: "Library", icon: Library },
    { label: "Statistics", icon: BarChart3 },
  ];

  /* ── Tab content renderer ──────────────────────────────────────────── */
  const renderTabContent = () => {
    /* ── Statistics ── */
    if (activeTab === "Statistics") {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-[var(--card-border)]">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading your analytics...
            </p>
          </div>
        );
      }
      if (user) return <EnhancedAnalyticsDashboard userId={user.id} />;
      return (
        <div className="text-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-[var(--card-border)]">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="text-amber-500" size={40} />
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Please log in to view your statistics
          </p>
          <Link href="/login">
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all">
              Go to Login
            </button>
          </Link>
        </div>
      );
    }

    /* ── My Courses ── */
    if (activeTab === "My Courses") {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-[var(--card-border)]">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading your courses...
            </p>
          </div>
        );
      }
      if (enrolledCourses.length === 0) {
        return (
          <EmptyState
            message="No enrolled courses yet"
            cta={
              <Link href="/generate">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all inline-flex items-center gap-2 mt-2">
                  Generate your first course
                  <ChevronRight size={18} />
                </button>
              </Link>
            }
          />
        );
      }
      return (
        <div className="grid grid-cols-1 gap-5">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
          ))}
        </div>
      );
    }

    /* ── Library (unenrolled / available) ── */
    if (activeTab === "Library") {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-[var(--card-border)]">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading library...
            </p>
          </div>
        );
      }
      if (unenrolledCourses.length === 0) {
        return (
          <EmptyState
            message="You're enrolled in all available courses!"
            cta={
              <Link href="/generate">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all inline-flex items-center gap-2 mt-2">
                  Generate a new course
                  <ChevronRight size={18} />
                </button>
              </Link>
            }
          />
        );
      }
      return (
        <div className="grid grid-cols-1 gap-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            {unenrolledCourses.length} course{unenrolledCourses.length !== 1 ? "s" : ""} available to enroll
          </p>
          {unenrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
          ))}
        </div>
      );
    }

    /* ── Dashboard (default) ── */
    return (
      <>
        <DailyReviewWidget />
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Ready to continue your AI-powered learning journey?
            </p>
          </div>
          <Link href="/generate">
            <button className="flex items-center gap-3 bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-serif font-bold transition-all shadow-lg hover:shadow-xl">
              <PlusCircle size={22} />
              New Course
            </button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[var(--card)] p-7 rounded-2xl border border-slate-200 dark:border-[var(--card-border)] shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}
                >
                  <stat.icon className="text-white" size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-mono">
                  Lifetime
                </span>
              </div>
              <div className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-[var(--card-border)]">
              <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Loading your courses...
              </p>
            </div>
          ) : error ? (
            /* ✅ Fixed: use AlertCircle + BookOpen instead of LogOut icon in error state */
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-lg">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-white" size={32} />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-6 font-semibold text-lg">
                {error}
              </p>
              <Link href="/login">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all">
                  Go to Login
                </button>
              </Link>
            </div>
          ) : myCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {myCourses.map((course) => (
                <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No courses yet"
              cta={
                <>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Start your learning journey today!
                  </p>
                  <Link href="/generate">
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all inline-flex items-center gap-2">
                      Create your first course
                      <ChevronRight size={18} />
                    </button>
                  </Link>
                </>
              }
            />
          )}
        </section>
      </>
    );
  };

  return (
    <div className="max-h-screen overflow-hidden h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#070a0f] dark:to-[#0a0c10] flex flex-col">
      {/* Desktop layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="w-72 shrink-0 h-full border-r border-slate-200 dark:border-[var(--sidebar-border)] bg-white dark:bg-[var(--sidebar)] hidden lg:flex flex-col shadow-xl">
          <div className="p-8 border-b border-slate-200 dark:border-[var(--sidebar-border)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-gray-900 dark:text-white block">
                  Learner Portal
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
                  Dashboard
                </span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-6 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-sm font-serif font-semibold rounded-xl transition-all ${activeTab === item.label
                  ? "text-white bg-amber-500 shadow-lg shadow-amber-500/25"
                  : "text-slate-600 dark:text-[var(--sidebar-muted)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[var(--sidebar-active)]"
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-200 dark:border-[var(--sidebar-border)] space-y-2">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[var(--sidebar-muted)]">
                Appearance
              </span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-serif font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 rounded-xl transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 h-full p-6 lg:p-12 overflow-y-auto pb-24 lg:pb-12">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile bottom nav — visible below lg */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[var(--sidebar)] border-t border-slate-200 dark:border-[var(--sidebar-border)] flex items-center justify-around px-2 py-2 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            aria-label={item.label}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${activeTab === item.label
              ? "text-amber-500"
              : "text-slate-500 dark:text-slate-400"
              }`}
          >
            <item.icon size={22} />
            <span className="hidden xs:block">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          aria-label="Sign Out"
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-red-500 text-xs font-semibold"
        >
          <LogOut size={22} />
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
