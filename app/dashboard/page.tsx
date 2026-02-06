"use client";

import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: number;
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
  const hasFetched = useRef(false); // Prevent multiple fetches

  useEffect(() => {
    // Prevent multiple calls
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchMyCourses = async () => {
      try {
        console.log("Fetching courses..."); // Debug log
        setIsLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("token");
        console.log("Token found:", !!token); // Debug log

        const response = await fetch("/api/courses/getCourse", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        });

        console.log("Response status:", response.status); // Debug log

        if (response.status === 401) {
          setError("Authentication required. Please log in.");
          setIsLoading(false);
          return; // Don't redirect, just show error
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Debug log

        if (data.success) {
          setMyCourses(data.courses || []);
        } else {
          setError(data.error || "Failed to load courses");
        }
      } catch (error) {
        console.error("Error loading courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, []); // Empty dependency array

  // Calculate total hours from all courses
  const totalHours = myCourses.reduce((acc, course) => {
    return acc + (course.modules?.length || 0) * 2;
  }, 0);

  // Calculate average progress across all courses
  const avgProgress =
    myCourses.length > 0
      ? Math.round(
          myCourses.reduce(
            (acc, course) => acc + (course.stats?.progressPercentage || 0),
            0,
          ) / myCourses.length,
        )
      : 0;

  // Count completed courses
  const completedCourses = myCourses.filter(
    (course) => course.stats?.progressPercentage === 100,
  ).length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: myCourses.filter((c) => c.isEnrolled).length.toString(),
      icon: BookOpen,
      color: "text-amber-600",
    },
    {
      label: "Hours Learned",
      value: `${totalHours}h`,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Avg. Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      label: "Certificates",
      value: completedCourses.toString(),
      icon: Award,
      color: "text-purple-600",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hidden lg:flex flex-col">
        <div className="p-6 border-b-2 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-black">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg dark:text-white">
              Learner Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {["Dashboard", "My Courses", "Library", "Statistics"].map((item) => (
            <button
              key={item}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                item === "Dashboard"
                  ? "text-amber-600 bg-amber-50 dark:bg-amber-900/10"
                  : "text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-gray-500 mt-1">
              Ready to continue your AI-powered learning?
            </p>
          </div>
          <Link href="/generate">
            <button className="flex items-center gap-2 bg-amber-500 hover:bg-slate-900 text-black hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20">
              <PlusCircle size={20} />
              New Course
            </button>
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`${stat.color}`} size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Lifetime
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-gray-500 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Active Courses
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Link href="/login">
                <button className="bg-amber-500 text-black px-6 py-2 rounded-xl font-bold hover:bg-amber-600">
                  Go to Login
                </button>
              </Link>
            </div>
          ) : myCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {myCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                        <PlayCircle size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.subject} • {course.level} •{" "}
                          {course.stats?.totalModules || 0} modules
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1 max-w-[200px] h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-1000"
                              style={{
                                width: `${course.stats?.progressPercentage || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            {course.stats?.progressPercentage || 0}% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 mb-4">
                No courses found. Start exploring!
              </p>
              <Link href="/generate">
                <button className="text-amber-500 font-bold hover:underline">
                  Create your first course →
                </button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
