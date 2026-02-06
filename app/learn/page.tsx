"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormData, generateCourse } from "../constants/actions";
import CourseBookUI from "../components/book";
import {
  BookOpen,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar,
  BrainCircuit,
} from "lucide-react";

const Page = () => {
  const [step, setStep] = useState(1);
  const [dbCourse, setDbCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    subject: "",
    level: "Beginner",
    goals: "",
    time: "",
    deadline: "",
    style: "",
  });

  /**
   * PHASE 1: Generate the high-level curriculum roadmap
   * and persist it to the Prisma database.
   */
  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 1. Get the curriculum roadmap from AI Action
      const results = await generateCourse(formData);
      if (!results?.data) throw new Error("AI Roadmap generation failed.");

      const courseRoadmap = JSON.parse(results.data.course);
      const meta = results.data.metadata;

      // 2. Save the structure to the Database
      // We add credentials: "include" to pass the auth-token cookie
      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // CRITICAL: Sends the HTTP-only cookie
        body: JSON.stringify({
          title: formData.subject,
          description: formData.goals,
          subject: formData.subject,
          level: formData.level,
          modules: courseRoadmap,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save course to database.");
      }

      const savedCourse = await response.json();

      // 3. Update state with the database object
      setDbCourse(savedCourse);
      setShowForm(false);

      // 4. Immediately trigger deep-dive generation for Module 1
      if (savedCourse.modules?.length > 0) {
        await fetchModuleContent(savedCourse.modules[0], meta);
      }
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

  /**
   * PHASE 2: Generate specific lesson content (deep-dives)
   * for a module only when requested.
   */
  const fetchModuleContent = useCallback(
    async (moduleFromDb: any, activeMeta: any) => {
      const modNum = moduleFromDb.moduleNumber;

      if (lessons[modNum]) return;

      console.log(
        `🚀 Requesting AI deep-dive for Module ${modNum}: ${moduleFromDb.moduleTitle}`,
      );

      try {
        const response = await fetch("/api/lessons/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // CRITICAL: Sends the HTTP-only cookie
          body: JSON.stringify({
            moduleId: moduleFromDb.id,
            course: {
              ...moduleFromDb,
              userLevel: activeMeta.level || "Intermediate",
              learningStyle: activeMeta.style || "Hands-on",
              availableTime: activeMeta.time || "2 hours per day",
              subject: activeMeta.subject || formData.subject,
            },
          }),
        });

        const result = await response.json();

        if (result.success && result.lessons) {
          setLessons((prev) => ({
            ...prev,
            [modNum]: result.lessons,
          }));
        } else {
          throw new Error(result.error || "Failed to generate lesson content");
        }
      } catch (error) {
        console.error(`Deep-dive failed for module ${modNum}:`, error);
      }
    },
    [lessons, formData.subject],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setDbCourse(null);
    setLessons({});
    setShowForm(true);
    setStep(1);
  };

  if (!showForm && dbCourse) {
    return (
      <CourseBookUI
        course={dbCourse.modules}
        lessons={lessons}
        onModuleSelect={(mod: any) => fetchModuleContent(mod, formData)}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-xl">
        {!loading && (
          <div className="flex justify-center gap-2 mb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === i ? "w-8 bg-amber-500" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center space-y-6"
              >
                <BrainCircuit className="w-16 h-16 text-amber-500 animate-pulse" />
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold italic">
                    Building your masterpiece...
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Architecting modules and learning paths
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-serif font-bold tracking-tight">
                  {step === 1 && "What's the mission?"}
                  {step === 2 && "The Logistics"}
                  {step === 3 && "Fine-tuning"}
                </h2>

                <div className="space-y-6">
                  {step === 1 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <BookOpen size={14} /> Subject Matter
                        </label>
                        <input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Quantum Physics"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Proficiency
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Beginner", "Intermediate", "Advanced"].map(
                            (lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() =>
                                  setFormData((p) => ({ ...p, level: lvl }))
                                }
                                className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                                  formData.level === lvl
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                {lvl}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Target size={14} /> Learning Goal
                        </label>
                        <textarea
                          name="goals"
                          value={formData.goals}
                          onChange={handleChange}
                          rows={3}
                          placeholder="What do you want to achieve?"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-slate-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Clock size={14} /> Time Commitment
                        </label>
                        <input
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="e.g. 10 hours total"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-slate-900"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Sparkles size={14} /> Learning Style
                        </label>
                        <input
                          name="style"
                          value={formData.style}
                          onChange={handleChange}
                          placeholder="e.g. Practical, Visual"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-slate-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Calendar size={14} /> Deadline
                        </label>
                        <input
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          placeholder="Target completion date"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-slate-900"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex-1 py-5 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={
                      step === 3 ? handleGenerate : () => setStep((s) => s + 1)
                    }
                    disabled={step === 1 && !formData.subject}
                    className="flex-[2] py-5 px-6 bg-amber-500 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {step === 3 ? "Generate Curriculum" : "Continue"}{" "}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Page;
