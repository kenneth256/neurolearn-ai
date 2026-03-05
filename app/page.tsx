"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "./components/ui/theme";
import {
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
  CheckCircle2,
  Lightbulb,
  Rocket,
  Layers,
  Play,
} from "lucide-react";

const LandingPage = () => {
  const router = useRouter();
  const [ctaTopic, setCtaTopic] = useState("");

  const handleCtaGenerate = () => {
    const topic = ctaTopic.trim();
    if (topic) {
      router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    } else {
      router.push("/generate");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-[#020617] text-[#0f172a] dark:text-[#f8fafc] font-sans selection:bg-amber-200 overflow-x-hidden">

      <nav aria-label="Main navigation" className="fixed top-0 w-full z-50 bg-[#fcfcf9]/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl blur-md opacity-75"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl text-white shadow-lg">
                <BrainCircuit size={26} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#f59e0b] to-[#d97706] bg-clip-text text-transparent">NeuronLearn</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 -mt-1">AI Education</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors">Sign In</Link>
            <ThemeToggle />
            <Link href="/generate" className="relative group px-6 py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-300 overflow-hidden">
              <span className="relative z-10">Start Learning Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#d97706] to-[#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </nav>

      <section id="main-content" aria-label="Hero: Learn anything with AI" className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#f59e0b]/10 dark:bg-[#fbbf24]/5 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#d97706]/10 dark:bg-[#f59e0b]/5 blur-[100px] rounded-full animate-pulse delay-1000"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#fffbeb] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-full">
                <Sparkles size={16} className="text-[#f59e0b] dark:text-[#fbbf24]" />
                <span className="text-sm font-semibold text-[#0f172a] dark:text-amber-200">AI-Powered Personalized Learning</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight font-serif">
                The Best AI Tutor to{" "}
                <span className="bg-gradient-to-r from-[#f59e0b] via-[#d97706] to-[#f59e0b] dark:from-[#fbbf24] dark:via-[#f59e0b] dark:to-[#fbbf24] bg-clip-text text-transparent">Learn Anything</span>
                {" "}Fast
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Tell us what you want to learn. Our AI instantly generates a complete, adaptive course—complete with{" "}
                <strong className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">video lessons, interactive quizzes, AI tutors, and personalized practice</strong>
                —tailored to how you learn best.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
                <Link href="/generate" className="group relative px-6 md:px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] text-white rounded-xl font-semibold text-base md:text-lg shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden" aria-label="Generate your free AI course">
                  <span className="relative z-10 flex items-center gap-2 md:gap-3">Generate Your Course Free<ArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d97706] to-[#f59e0b] dark:from-[#f59e0b] dark:to-[#fbbf24] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-white dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f8fafc] border-2 border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-lg hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all flex items-center justify-center gap-3 group" aria-label="Watch how Neurolearn AI works">
                  <Play size={20} className="group-hover:scale-110 transition-transform" />See How It Works
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3" aria-hidden="true">
                  {["AK", "MJ", "RL", "SP"].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] border-2 border-[#fcfcf9] dark:border-[#020617] flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">50,000+ learners</div>
                  <div className="text-slate-500 dark:text-slate-400">generating courses daily</div>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative" aria-hidden="true">
              <div className="relative bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
                <div className="space-y-3">
                  <label htmlFor="hero-course-input" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">What do you want to learn?</label>
                  <div className="relative">
                    <input id="hero-course-input" type="text" aria-label="What do you want to learn?" placeholder="Machine Learning Fundamentals" className="w-full px-4 py-4 bg-slate-50 dark:bg-[#020617] border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium text-[#0f172a] dark:text-[#f8fafc] focus:border-[#f59e0b] dark:focus:border-[#fbbf24] outline-none transition-colors" disabled />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2"><Sparkles size={20} className="text-[#f59e0b] dark:text-[#fbbf24] animate-pulse" /></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Generating...</span>
                    <span className="text-xs font-mono text-[#f59e0b] dark:text-[#fbbf24]">2.3s</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Video, title: "Introduction to ML", type: "12 min video" },
                      { icon: FileText, title: "Key Concepts & Theory", type: "Reading" },
                      { icon: Target, title: "Practice Quiz (15Q)", type: "Interactive" },
                      { icon: MessageSquare, title: "AI Tutor", type: "24/7" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 p-3 bg-[#fffbeb]/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl">
                        <div className="p-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] rounded-lg text-white"><item.icon size={16} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#0f172a] dark:text-[#f8fafc] truncate">{item.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.type}</div>
                        </div>
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Course Progress</span>
                    <span className="text-xs font-mono font-bold text-[#f59e0b] dark:text-[#fbbf24]">0%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-[#020617] rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="hidden sm:block absolute -right-4 -top-4 p-4 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Zap size={20} className="text-green-600" /></div>
                  <div><div className="text-xs text-slate-500 dark:text-slate-400">Engagement</div><div className="font-bold text-green-600">98%</div></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="hidden sm:block absolute -left-4 bottom-8 p-4 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><BarChart3 size={20} className="text-blue-600" /></div>
                  <div><div className="text-xs text-slate-500 dark:text-slate-400">Mastery</div><div className="font-bold text-blue-600">Advanced</div></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-label="How Neurolearn AI works" className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-[#0f172a]/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">From Prompt to{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Mastery</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Our AI analyzes your learning style and generates a complete educational experience in seconds</p>
          </div>
          <ol className="grid md:grid-cols-3 gap-8 list-none">
            {[
              { step: "01", icon: Lightbulb, title: "Describe What You Want to Learn", description: "Simply type what you want to learn. 'Web Development', 'Quantum Physics', 'Spanish for Travel'—anything." },
              { step: "02", icon: BrainCircuit, title: "AI Generates Your Full Course", description: "Our AI creates a complete curriculum with video lessons, interactive content, quizzes, and practice exercises—all personalized to your level." },
              { step: "03", icon: Rocket, title: "Learn & Adapt in Real-Time", description: "Your AI tutor monitors your progress, adjusts difficulty, provides instant feedback, and ensures you actually master the material." },
            ].map((item, i) => (
              <li key={i} className="relative p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all group">
                <div className="absolute top-4 right-4 text-6xl font-bold text-slate-100 dark:text-slate-800/50 group-hover:text-[#f59e0b]/20 dark:group-hover:text-[#fbbf24]/20 transition-colors" aria-hidden="true">{item.step}</div>
                <div className="relative space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/50"><item.icon size={28} strokeWidth={2} aria-hidden="true" /></div>
                  <h3 className="text-xl md:text-2xl font-bold font-serif">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Neurolearn AI features" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">Everything You Need to{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Actually Learn</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Not just content delivery. A complete adaptive learning ecosystem powered by AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Video className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" />} title="AI-Generated Video Lessons" description="Professional video content created instantly, complete with visuals, animations, and clear explanations tailored to your level." gradient="from-[#f59e0b]/10 to-[#d97706]/10 dark:from-[#fbbf24]/10 dark:to-[#f59e0b]/10" />
            <FeatureCard icon={<Target className="text-blue-500" aria-hidden="true" />} title="Adaptive Quizzes" description="Smart assessments that adjust difficulty in real-time based on your performance. No more too-easy or impossibly hard questions." gradient="from-blue-500/10 to-cyan-500/10" />
            <FeatureCard icon={<MessageSquare className="text-green-500" aria-hidden="true" />} title="24/7 AI Tutor" description="Ask questions anytime. Get instant, personalized explanations. Your AI tutor knows exactly where you're stuck and how to help." gradient="from-green-500/10 to-emerald-500/10" />
            <FeatureCard icon={<BarChart3 className="text-purple-500" aria-hidden="true" />} title="Real-Time Learning Analytics" description="Track your progress, engagement, and mastery levels. See exactly what you know and what needs more practice." gradient="from-purple-500/10 to-pink-500/10" />
            <FeatureCard icon={<Zap className="text-yellow-500" aria-hidden="true" />} title="Engagement Monitoring" description="The system detects when you're confused or losing focus and automatically adjusts content or provides extra support." gradient="from-yellow-500/10 to-orange-500/10" />
            <FeatureCard icon={<Layers className="text-indigo-500" aria-hidden="true" />} title="Multi-Modal Learning" description="Videos, interactive simulations, reading materials, and hands-on exercises—all in one cohesive learning path." gradient="from-indigo-500/10 to-purple-500/10" />
          </div>
        </div>
      </section>

      <section aria-label="Learning outcomes and statistics" className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-[#0f172a]/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">AI Learning That Actually{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Works</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Data-driven results from thousands of learners</p>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Retention Rate", val: "4.5x", desc: "vs traditional methods" },
              { label: "Course Completion", val: "87%", desc: "finish their courses" },
              { label: "Avg Mastery Score", val: "92%", desc: "proficiency achieved" },
              { label: "Time Saved", val: "60%", desc: "faster than classroom" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <dd className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent font-serif">{stat.val}</dd>
                <dt className="text-sm font-semibold uppercase tracking-wider mb-1 text-[#0f172a] dark:text-[#f8fafc]">{stat.label}</dt>
                <dd className="text-xs text-slate-500 dark:text-slate-400">{stat.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="Browse subjects available on Neurolearn AI" className="py-16 md:py-24 px-4 md:px-6 bg-slate-50 dark:bg-[#0f172a]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">Learn{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Literally Anything</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From programming to philosophy, music theory to machine learning — generate a free AI course on any topic instantly</p>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none">
            {["Web Development", "Machine Learning", "Digital Marketing", "Photography", "Spanish Language", "Music Theory", "Quantum Physics", "Creative Writing", "Data Science", "UI/UX Design", "Blockchain", "Psychology"].map((subject, i) => (
              <li key={i}>
                <Link href={`/generate?topic=${encodeURIComponent(subject)}`} className="w-full block p-4 bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-[#0f172a] dark:text-[#f8fafc] hover:border-[#f59e0b] dark:hover:border-[#fbbf24] hover:bg-[#fffbeb] dark:hover:bg-amber-950/20 transition-all group text-center" aria-label={`Learn ${subject} with AI`}>
                  <span className="group-hover:text-[#f59e0b] dark:group-hover:text-[#fbbf24] transition-colors">{subject}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Popular AI learning paths" className="py-12 md:py-16 px-4 md:px-6 bg-white dark:bg-[#0f172a]/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 font-serif">Popular{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Learning Paths</span></h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">Jump into one of our most popular AI-generated courses</p>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 list-none">
            {[
              { label: "Learn Python", href: "/generate?topic=Python" },
              { label: "Learn JavaScript", href: "/generate?topic=JavaScript" },
              { label: "Learn React", href: "/generate?topic=React" },
              { label: "Learn SQL", href: "/generate?topic=SQL" },
              { label: "Learn Excel", href: "/generate?topic=Excel" },
              { label: "Learn French", href: "/generate?topic=French+Language" },
              { label: "Learn Guitar", href: "/generate?topic=Guitar" },
              { label: "Learn Investing", href: "/generate?topic=Investing" },
              { label: "Learn Calculus", href: "/generate?topic=Calculus" },
              { label: "Learn Drawing", href: "/generate?topic=Drawing" },
              { label: "Learn SEO", href: "/generate?topic=SEO" },
              { label: "Learn Video Editing", href: "/generate?topic=Video+Editing" },
            ].map((item, i) => (
              <li key={i}>
                <Link href={item.href} className="block text-center px-3 py-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] hover:text-[#f59e0b] dark:hover:text-[#fbbf24] hover:bg-[#fffbeb] dark:hover:bg-amber-950/20 transition-all" aria-label={`${item.label} with AI`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Frequently asked questions about Neurolearn AI" className="py-16 md:py-24 px-4 md:px-6 bg-slate-50 dark:bg-[#0f172a]/30 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">Frequently Asked{" "}<span className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">Questions</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">Everything you need to know about Neurolearn AI</p>
          </div>
          <dl className="space-y-4">
            {[
              { q: "What is Neurolearn AI?", a: "Neurolearn AI is a free AI-powered tutoring platform that generates personalized lessons, quizzes, video content, and learning paths on any subject from a single prompt." },
              { q: "Is Neurolearn AI free to use?", a: "Yes. Neurolearn AI offers a free plan that lets you start generating full AI courses immediately — no credit card required." },
              { q: "How does Neurolearn AI work?", a: "Type any subject or topic and Neurolearn AI instantly generates a complete course: structured lessons, video content, interactive quizzes, and a personalized learning path — all in under 3 seconds." },
              { q: "What subjects can I learn with Neurolearn AI?", a: "Any subject — from web development, machine learning, and data science to Spanish, music theory, creative writing, and quantum physics." },
              { q: "How is Neurolearn AI different from other AI tutors?", a: "Unlike general-purpose AI chatbots, Neurolearn AI is purpose-built for education. It generates structured multi-module courses, tracks learning progress, adapts difficulty in real-time, and provides a 24/7 AI tutor — not just answers." },
              { q: "How long does it take to generate a course?", a: "Neurolearn AI generates a complete course with video lessons, quizzes, and a personalized learning path in 2–3 seconds." },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="Get started with Neurolearn AI for free" className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden bg-white dark:bg-[#0f172a]/50 border-y border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fffbeb]/50 via-[#fcfcf9] to-[#fffbeb]/50 dark:from-[#0f172a] dark:via-[#020617] dark:to-[#0f172a]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 text-[#f59e0b] dark:text-slate-600"></div>
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-[#f59e0b]/10 dark:bg-[#fbbf24]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#d97706]/10 dark:bg-[#f59e0b]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fffbeb] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-full">
              <Sparkles size={18} className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#0f172a] dark:text-amber-200">50,000+ courses generated this week</span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight font-serif text-[#0f172a] dark:text-[#f8fafc]">
              Start Learning Anything<br />
              <span className="inline-block bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] text-white px-6 py-2 rounded-2xl mt-2">For Free Today</span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light">
              Type what you want to learn. Get a complete course with videos, quizzes, and AI tutoring{" "}
              <strong className="font-bold underline decoration-[#f59e0b]/50 dark:decoration-[#fbbf24]/50 underline-offset-4 text-[#0f172a] dark:text-[#f8fafc]">in under 3 seconds</strong>.
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto">
              <div className="relative flex flex-col sm:block gap-3">
                <label htmlFor="cta-course-input" className="sr-only">Enter a topic to generate your free AI course</label>
                <input id="cta-course-input" type="text" aria-label="Enter a topic to generate your free AI course" placeholder="e.g., Machine Learning for Beginners..." value={ctaTopic} onChange={(e) => setCtaTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCtaGenerate()} className="w-full px-6 sm:px-8 sm:pr-56 py-4 sm:py-6 text-base sm:text-lg bg-white/95 backdrop-blur-sm text-[#0f172a] rounded-2xl border-2 border-white/50 focus:border-white outline-none shadow-2xl placeholder:text-slate-400 mb-3 sm:mb-0" />
                <button onClick={handleCtaGenerate} className="static sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2" aria-label="Generate free AI course">
                  <span className="hidden sm:inline">Generate Free Course</span>
                  <span className="sm:hidden">Generate Course</span>
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="grid md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
              {[
                { icon: Zap, title: "Instant Generation", desc: "Course ready in 2–3 seconds" },
                { icon: CheckCircle2, title: "No Credit Card", desc: "Start learning for free" },
                { icon: Award, title: "Proven Results", desc: "4.5x better retention" },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white dark:bg-[#0f172a] backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all">
                  <div className="w-12 h-12 bg-[#fffbeb] dark:bg-amber-950/30 rounded-xl flex items-center justify-center mb-4 mx-auto"><item.icon size={24} className="text-[#f59e0b] dark:text-[#fbbf24]" aria-hidden="true" /></div>
                  <div className="font-bold mb-1 text-[#0f172a] dark:text-[#f8fafc]">{item.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</div>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-8 pt-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white dark:bg-[#0f172a] border-2 border-[#f59e0b] dark:border-[#fbbf24] flex items-center justify-center text-[#f59e0b] dark:text-[#fbbf24] font-bold text-xs shadow-lg">{i}</div>
                  ))}
                </div>
                <div className="text-left text-sm">
                  <div className="font-bold text-[#0f172a] dark:text-[#f8fafc]">2,847 people</div>
                  <div className="text-slate-600 dark:text-slate-400">started learning today</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0f172a] backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((i) => (<Award key={i} size={16} className="text-[#f59e0b] dark:text-[#fbbf24] fill-[#f59e0b] dark:fill-[#fbbf24]" aria-hidden="true" />))}
                </div>
                <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer aria-label="Site footer" className="py-12 md:py-16 px-4 md:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 mb-12">
            <div className="sm:col-span-2 lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] rounded-xl text-white shadow-lg"><BrainCircuit size={24} aria-hidden="true" /></div>
                <div>
                  <span className="font-bold text-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] dark:from-[#fbbf24] dark:to-[#f59e0b] bg-clip-text text-transparent">NeuronLearn</span>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">AI Education Platform</div>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">The best free AI tutor to learn anything instantly. Generate personalized courses, quizzes, and video lessons from a single prompt.</p>
              <nav aria-label="Social media links" className="flex items-center gap-4">
                <a href="https://twitter.com/neurolearnai" aria-label="Follow Neurolearn AI on Twitter" className="text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="https://github.com/neurolearnai" aria-label="View Neurolearn AI on GitHub" className="text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
              </nav>
            </div>

            <nav aria-label="Platform links" className="sm:col-span-1 lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Features</Link></li>
                <li><Link href="/pricing" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Pricing</Link></li>
                <li><Link href="/how-it-works" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">How it Works</Link></li>
                <li><Link href="/demo" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Interactive Demo</Link></li>
                <li><Link href="/faq" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">FAQ</Link></li>
                <li><Link href="/blog" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Blog</Link></li>
              </ul>
            </nav>

            <nav aria-label="Company links" className="sm:col-span-1 lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">About Us</Link></li>
                <li><Link href="/careers" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] text-sm">Contact</Link></li>
              </ul>
            </nav>

            <div className="sm:col-span-2 lg:col-span-4 space-y-4">
              <h3 className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">Find Us</h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-40 relative bg-slate-100 dark:bg-slate-800">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.507640204439!3d37.757814996609724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1709664687000!5m2!1sen!2sus" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Neurolearn AI Headquarters — San Francisco, CA"></iframe>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} NeuronLearn AI. All rights reserved.</div>
            <nav aria-label="Legal links" className="flex gap-6">
              <Link href="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#f59e0b] dark:hover:text-[#fbbf24] transition-colors">Terms of Service</Link>
            </nav>
          </div>
        </div>
      </footer>

    </div>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <dt>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-[#0f172a] dark:text-[#f8fafc] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          {question}
          <span className={`ml-4 flex-shrink-0 text-[#f59e0b] dark:text-[#fbbf24] transition-transform duration-200 ${open ? "rotate-45" : ""}`} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </span>
        </button>
      </dt>
      {open && (
        <dd className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">{answer}</dd>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) => (
  <article className="group relative p-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-all hover:shadow-xl">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity`}></div>
    <div className="relative space-y-4">
      <div className="w-12 h-12 bg-slate-100 dark:bg-[#020617] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-[#0f172a] dark:text-[#f8fafc] font-serif">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  </article>
);

export default LandingPage;