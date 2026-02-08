"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar,
  BrainCircuit,
} from "lucide-react";
import { generateCourse } from "@/app/constants/actions";

interface FormData {
  subject: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  goals: string;
  time: string;
  deadline: string;
  style: string;
}

const Page = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    subject: "",
    level: "Beginner",
    goals: "",
    time: "",
    deadline: "",
    style: "",
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const results = await generateCourse(formData);
      if (!results?.data?.course) {
        throw new Error("AI Roadmap generation failed.");
      }

      let parsed: any;
      try {
        const jsonText = results.data.course.trim();
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error("AI returned invalid JSON.");
      }

      const modules = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.modules)
        ? parsed.modules
        : null;

      if (!modules || modules.length === 0) {
        throw new Error("AI returned no valid modules.");
      }

      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.subject,
          description: formData.goals,
          subject: formData.subject,
          level: formData.level,
          goals: formData.goals,
          generationParams: { modules },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save course to database.");
      }

      const courseId = data?.course?.id ?? data?.id;
      if (!courseId) {
        throw new Error("Course was created but no ID was returned.");
      }

      window.location.href = `/${courseId}`;
    } catch (error) {
      console.error("Generation Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-2xl">
        {!loading && (
          <div className="flex justify-center gap-3 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  step === i
                    ? "w-12 h-2 rounded-full bg-amber-500 shadow-md"
                    : step > i
                    ? "w-8 h-2 rounded-full bg-amber-300"
                    : "w-3 h-2 rounded-full bg-slate-300 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-12 relative overflow-hidden transition-colors">
          <div className="absolute top-6 left-6 text-amber-500 text-2xl">❧</div>
          <div className="absolute top-6 right-6 text-amber-500 text-2xl">
            ❧
          </div>

          <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] pointer-events-none" />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 flex flex-col items-center space-y-8"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-t-amber-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                    Crafting Your Curriculum
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500">
                    Assembling Knowledge Folios
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-serif italic">
                    Building modules and learning paths...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 relative z-10"
              >
                <div className="pb-8 border-b-2 border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-mono uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500 mb-3">
                    Chapter {step} of 3
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                    {step === 1 && "Foundation & Focus"}
                    {step === 2 && "Objectives & Timeline"}
                    {step === 3 && "Personalization"}
                  </h2>
                </div>

                <div className="space-y-8">
                  {step === 1 && (
                    <>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
                            <BookOpen
                              size={18}
                              className="text-amber-600 dark:text-amber-500"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Subject Matter
                            </div>
                            <div className="text-sm font-serif text-slate-700 dark:text-slate-300 italic">
                              What shall we study?
                            </div>
                          </div>
                        </label>
                        <input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Advanced Calculus, Medieval History..."
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 dark:focus:border-amber-700 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white font-serif placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 block mb-4">
                          Current Proficiency Level
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {(
                            ["Beginner", "Intermediate", "Advanced"] as const
                          ).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, level: lvl }))
                              }
                              className={`p-6 rounded-xl border-2 transition-all font-serif font-bold ${
                                formData.level === lvl
                                  ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                                  : "bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
                            <Target
                              size={18}
                              className="text-amber-600 dark:text-amber-500"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Learning Objectives
                            </div>
                            <div className="text-sm font-serif text-slate-700 dark:text-slate-300 italic">
                              Your academic aspirations
                            </div>
                          </div>
                        </label>
                        <textarea
                          name="goals"
                          value={formData.goals}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Describe what you hope to master and achieve through this course of study..."
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 dark:focus:border-amber-700 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white font-serif resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic leading-relaxed"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
                            <Clock
                              size={18}
                              className="text-amber-600 dark:text-amber-500"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Time Dedication
                            </div>
                            <div className="text-sm font-serif text-slate-700 dark:text-slate-300 italic">
                              Hours available for study
                            </div>
                          </div>
                        </label>
                        <input
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="e.g. 2 hours daily, 10 hours weekly..."
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 dark:focus:border-amber-700 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white font-serif placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
                            <Sparkles
                              size={18}
                              className="text-amber-600 dark:text-amber-500"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Pedagogical Preference
                            </div>
                            <div className="text-sm font-serif text-slate-700 dark:text-slate-300 italic">
                              How you learn best
                            </div>
                          </div>
                        </label>
                        <input
                          name="style"
                          value={formData.style}
                          onChange={handleChange}
                          placeholder="e.g. Visual demonstrations, hands-on practice, theoretical deep-dives..."
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 dark:focus:border-amber-700 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white font-serif placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
                            <Calendar
                              size={18}
                              className="text-amber-600 dark:text-amber-500"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Target Completion
                            </div>
                            <div className="text-sm font-serif text-slate-700 dark:text-slate-300 italic">
                              Your academic deadline
                            </div>
                          </div>
                        </label>
                        <input
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          placeholder="e.g. March 2026, End of semester..."
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 dark:focus:border-amber-700 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white font-serif placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-8 flex gap-4 border-t-2 border-slate-100 dark:border-slate-800">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex-1 py-5 rounded-xl font-serif font-bold border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                    >
                      ← Previous
                    </button>
                  )}
                  <button
                    onClick={
                      step === 3 ? handleGenerate : () => setStep((s) => s + 1)
                    }
                    disabled={step === 1 && !formData.subject}
                    className="flex-[2] py-5 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-serif font-bold hover:from-amber-600 hover:to-orange-600 hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none text-lg"
                  >
                    {step === 3 ? (
                      <>
                        <span>Generate Curriculum</span>
                        <Sparkles size={20} />
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-10 space-y-2">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500">
            Bespoke Education
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-serif italic">
            Personalized curricula, crafted by artificial intelligence
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
