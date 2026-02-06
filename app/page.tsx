"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Target,
  Zap,
  Award,
  MessageSquare,
  Video,
  FileText,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  Lightbulb,
  Rocket,
  Globe,
  Layers,
  Play,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950/10 text-gray-900 dark:text-gray-100 font-sans selection:bg-amber-200 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-md opacity-75"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg">
                <BrainCircuit size={26} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                NeuronLearn
              </span>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 -mt-1">
                AI Education
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 hover:text-amber-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/generate"
              className="relative group px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Learning Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-400/5 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-400/10 dark:bg-orange-400/5 blur-[100px] rounded-full animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-full"
              >
                <Sparkles size={16} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  AI-Powered Personalized Learning
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight"
              >
                Learn{" "}
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Anything
                </span>
                <br />
                From a Single
                <br />
                Prompt
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl"
              >
                Tell us what you want to learn. Our AI instantly generates a
                complete, adaptive course—complete with{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  video lessons, interactive quizzes, AI tutors, and
                  personalized practice
                </span>
                —tailored to how you learn best.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/generate"
                  className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Generate Your Course
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-lg hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center justify-center gap-3 group">
                  <Play
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Watch Demo
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {i}k
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    50,000+ learners
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    generating courses daily
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Visual Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Main Card */}
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-6">
                {/* Input Example */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    What do you want to learn?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Machine Learning Fundamentals"
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-colors"
                      disabled
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Sparkles
                        size={20}
                        className="text-amber-500 animate-pulse"
                      />
                    </div>
                  </div>
                </div>

                {/* Generated Content Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      AI Generating...
                    </span>
                    <span className="text-xs font-mono text-amber-600">
                      2.3s
                    </span>
                  </div>

                  {/* Module Cards */}
                  <div className="space-y-2">
                    {[
                      {
                        icon: Video,
                        title: "Introduction to ML",
                        type: "12 min video",
                      },
                      {
                        icon: FileText,
                        title: "Key Concepts & Theory",
                        type: "Reading",
                      },
                      {
                        icon: Target,
                        title: "Practice Quiz (15Q)",
                        type: "Interactive",
                      },
                      { icon: MessageSquare, title: "AI Tutor", type: "24/7" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl"
                      >
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white">
                          <item.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.type}
                          </div>
                        </div>
                        <CheckCircle2
                          size={16}
                          className="text-green-500 flex-shrink-0"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Course Progress
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-600">
                      0%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 -top-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Zap size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Engagement</div>
                    <div className="font-bold text-green-600">98%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -left-4 bottom-8 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Mastery</div>
                    <div className="font-bold text-blue-600">Advanced</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Prompt to{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mastery
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI analyzes your learning style and generates a complete
              educational experience in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Lightbulb,
                title: "Describe What You Want",
                description:
                  "Simply type what you want to learn. 'Web Development', 'Quantum Physics', 'Spanish for Travel'—anything.",
              },
              {
                step: "02",
                icon: BrainCircuit,
                title: "AI Generates Your Course",
                description:
                  "Our AI creates a complete curriculum with video lessons, interactive content, quizzes, and practice exercises—all personalized to your level.",
              },
              {
                step: "03",
                icon: Rocket,
                title: "Learn & Adapt in Real-Time",
                description:
                  "Your AI tutor monitors your progress, adjusts difficulty, provides instant feedback, and ensures you actually master the material.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
              >
                <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 dark:text-gray-800/50 group-hover:text-amber-500/20 transition-colors">
                  {item.step}
                </div>
                <div className="relative space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/50">
                    <item.icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Actually Learn
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Not just content delivery. A complete adaptive learning ecosystem
              powered by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Video className="text-amber-500" />}
              title="AI-Generated Video Lessons"
              description="Professional video content created instantly, complete with visuals, animations, and clear explanations tailored to your level."
              gradient="from-amber-500/10 to-orange-500/10"
            />
            <FeatureCard
              icon={<Target className="text-blue-500" />}
              title="Adaptive Quizzes"
              description="Smart assessments that adjust difficulty in real-time based on your performance. No more too-easy or impossibly hard questions."
              gradient="from-blue-500/10 to-cyan-500/10"
            />
            <FeatureCard
              icon={<MessageSquare className="text-green-500" />}
              title="24/7 AI Tutor"
              description="Ask questions anytime. Get instant, personalized explanations. Your AI tutor knows exactly where you're stuck and how to help."
              gradient="from-green-500/10 to-emerald-500/10"
            />
            <FeatureCard
              icon={<BarChart3 className="text-purple-500" />}
              title="Real-Time Analytics"
              description="Track your progress, engagement, and mastery levels. See exactly what you know and what needs more practice."
              gradient="from-purple-500/10 to-pink-500/10"
            />
            <FeatureCard
              icon={<Zap className="text-yellow-500" />}
              title="Engagement Monitoring"
              description="The system detects when you're confused or losing focus and automatically adjusts content or provides extra support."
              gradient="from-yellow-500/10 to-orange-500/10"
            />
            <FeatureCard
              icon={<Layers className="text-indigo-500" />}
              title="Multi-Modal Learning"
              description="Videos, interactive simulations, reading materials, and hands-on exercises—all in one cohesive learning path."
              gradient="from-indigo-500/10 to-purple-500/10"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Learning That Actually{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Data-driven results from thousands of learners
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Retention Rate", val: "4.5x", desc: "vs traditional" },
              { label: "Completion", val: "87%", desc: "finish courses" },
              { label: "Avg Mastery", val: "92%", desc: "proficiency" },
              { label: "Time Saved", val: "60%", desc: "faster learning" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stat.val}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider mb-1 text-gray-900 dark:text-white">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Subjects */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Learn{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Literally Anything
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From programming to philosophy, music theory to machine learning
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Web Development",
              "Machine Learning",
              "Digital Marketing",
              "Photography",
              "Spanish Language",
              "Music Theory",
              "Quantum Physics",
              "Creative Writing",
              "Data Science",
              "UI/UX Design",
              "Blockchain",
              "Psychology",
            ].map((subject, i) => (
              <button
                key={i}
                className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-900 dark:text-white hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all group"
              >
                <span className="group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                  {subject}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Hero Style */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center text-white space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
            >
              <Sparkles size={18} className="text-white" />
              <span className="text-sm font-semibold">
                50,000+ courses generated this week
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              Ready to Learn
              <br />
              <span className="inline-block bg-white text-amber-600 px-6 py-2 rounded-2xl mt-2">
                Anything?
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light"
            >
              Type what you want to learn. Get a complete course with videos,
              quizzes, and AI tutoring{" "}
              <span className="font-bold underline decoration-white/50 underline-offset-4">
                in under 3 seconds
              </span>
              .
            </motion.p>

            {/* Input Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Machine Learning for Beginners..."
                  className="w-full px-8 py-6 text-lg bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl border-2 border-white/50 focus:border-white outline-none shadow-2xl placeholder:text-gray-400"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                  Generate Course
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto"
            >
              {[
                {
                  icon: Zap,
                  title: "Instant Generation",
                  desc: "Course ready in 2-3 seconds",
                },
                {
                  icon: CheckCircle2,
                  title: "No Credit Card",
                  desc: "Start learning for free",
                },
                {
                  icon: Award,
                  title: "Proven Results",
                  desc: "4.5x better retention",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <item.icon size={24} className="text-white" />
                  </div>
                  <div className="font-bold mb-1">{item.title}</div>
                  <div className="text-sm text-white/80">{item.desc}</div>
                </div>
              ))}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-8 pt-6 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center text-amber-600 font-bold text-xs shadow-lg"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-left text-sm">
                  <div className="font-bold">2,847 people</div>
                  <div className="text-white/80">started learning today</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Award
                      key={i}
                      size={16}
                      className="text-yellow-300 fill-yellow-300"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg">
                <BrainCircuit size={24} />
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  NeuronLearn
                </span>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  AI Education Platform
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 NeuronLearn. Powered by Gemini AI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) => (
  <div className="group relative p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-xl">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity`}
    ></div>
    <div className="relative space-y-4">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default LandingPage;
