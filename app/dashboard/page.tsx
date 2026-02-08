"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "../api/lib/auth/getUser";
import PerformanceDashboardComponent, {
  EnhancedAnalyticsDashboard,
} from "../components/ui/perfom";
import { apiClient } from "../api/lib/client.ts/client";

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
      } catch (error) {
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const totalHours = myCourses.reduce((acc, course) => {
    return acc + (course.modules?.length || 0) * 2;
  }, 0);

  const avgProgress =
    myCourses.length > 0
      ? Math.round(
          myCourses.reduce(
            (acc, course) => acc + (course.stats?.progressPercentage || 0),
            0,
          ) / myCourses.length,
        )
      : 0;

  const completedCourses = myCourses.filter(
    (course) => course.stats?.progressPercentage === 100,
  ).length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: myCourses.filter((c) => c.isEnrolled).length.toString(),
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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
        router.push("/");
      }
    } catch (error) {}
  };

  const navItems = [
    { label: "Dashboard", icon: Home },
    { label: "My Courses", icon: BookOpen },
    { label: "Library", icon: Library },
    { label: "Statistics", icon: BarChart3 },
  ];

  return (
    <div className="max-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 flex transition-colors">
      <aside className="w-72 border-r-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-900 hidden lg:flex flex-col shadow-xl">
        <div className="p-8 border-b-2 border-slate-200 dark:border-slate-800">
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
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-sm font-serif font-semibold rounded-xl transition-all ${
                activeTab === item.label
                  ? "text-white bg-amber-500 shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t-2 border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-serif font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {activeTab === "Statistics" ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
              <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Loading your analytics...
              </p>
            </div>
          ) : user ? (
            <EnhancedAnalyticsDashboard userId={user?.id} />
          ) : (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
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
          )
        ) : (
          <>
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back
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
                  className="bg-white dark:bg-gray-900 p-7 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
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
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                  <Loader2
                    className="animate-spin text-amber-500 mb-4"
                    size={48}
                  />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Loading your courses...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-lg">
                  <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <LogOut className="text-white" size={32} />
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
                  {myCourses.map((course) => {
                    const isEnrolled =
                      course.stats?.progressPercentage !== undefined;

                    return (
                      <div key={course.id}>
                        {isEnrolled ? (
                          <Link href={`/courses/${course.id}`}>
                            <motion.div
                              whileHover={{ x: 8 }}
                              className="bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between group cursor-pointer"
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
                                        style={{
                                          width: `${
                                            course.stats?.progressPercentage ||
                                            0
                                          }%`,
                                        }}
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
                          // Not enrolled - show enroll button
                          <motion.div
                            whileHover={{ x: 8 }}
                            className="bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between group"
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
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-serif italic">
                                  Not enrolled yet
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  await apiClient.enrollCourse(course.id);
                                  toast.success("Enrolled successfully!");

                                  window.location.reload();
                                } catch (error) {
                                  toast.error("Failed to enroll");
                                }
                              }}
                              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-serif font-bold transition-all"
                            >
                              Enroll Now
                            </button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="text-amber-500" size={40} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                    No courses yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Start your learning journey today!
                  </p>
                  <Link href="/generate">
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-serif font-bold shadow-lg transition-all inline-flex items-center gap-2">
                      Create your first course
                      <ChevronRight size={18} />
                    </button>
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
