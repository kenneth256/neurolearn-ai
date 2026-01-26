"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormData, generateCourse, generateLessons } from "./constants/actions";
import CourseBookUI from "./components/book";
import {
  BookOpen,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  Calendar,
  BrainCircuit,
} from "lucide-react";
import { LessonsData } from "./constants/utils";
import CapstoneProject, { ProjectData } from "./components/ui/protocol";

const Page = () => {
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Record<number, LessonsData>>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // 1. Persistence Layer: Hydration Logic
  useEffect(() => {
    try {
      const savedCourse = localStorage.getItem("course_cache");
      const savedLessons = localStorage.getItem("lessons_cache");

      if (savedCourse && savedLessons) {
        setCourse(JSON.parse(savedCourse));
        setLessons(JSON.parse(savedLessons));
        setShowForm(false);
      }
    } catch (e) {
      console.error("Failed to hydrate from local storage", e);
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    if (course) localStorage.setItem("course_cache", JSON.stringify(course));
    if (lessons) {
      localStorage.setItem("lessons_cache", JSON.stringify(lessons));
    }
  }, [course, lessons]);

  const [formData, setFormData] = useState<FormData>({
    subject: "",
    level: "",
    goals: "",
    time: "",
    deadline: "",
    style: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 1. Generate the Course Structure (Modules)
      const results = await generateCourse(formData);
      if (!results?.data) throw new Error("Course generation failed.");

      const courseData = JSON.parse(results.data.course);
      setCourse(courseData);

      if (!courseData || courseData.length === 0) {
        throw new Error("No modules found.");
      }

      // 2. Transition to the Book UI immediately
      // This lets the user see the Table of Contents while lessons generate
      setShowForm(false);
      setLoading(false);

      // 3. Loop through modules and generate lessons one-by-one
      for (let i = 0; i < courseData.length; i++) {
        const module = courseData[i];

        try {
          const response = await generateLessons({
            course: {
              ...module,
              userLevel: results.data.metadata.level,
              learningStyle: results.data.metadata.style,
              availableTime: results.data.metadata.time,
              subject: results.data.metadata.subject,
            },
          });

          if (response?.success && response.lessons) {
            const moduleNum = response.lessons.moduleNumber;

            // 4. Update state INCREMENTALLY
            // This triggers a re-render so the Book UI shows the new lesson instantly
            setLessons((prev) => ({
              ...prev,
              [moduleNum]: response.lessons,
            }));

            console.log(`✅ Module ${moduleNum} loaded.`);
          }

          // Small delay to prevent API rate limiting (429 errors)
          if (i < courseData.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        } catch (error) {
          console.error(
            `Failed to generate lessons for module ${i + 1}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error("Architect Error:", error);
      setLoading(false);
      alert(
        "The AI Architect hit a snag. Please check your connection and try again.",
      );
    }
  };

  // IF GENERATION IS COMPLETE, SHOW THE BOOK
  if (!showForm && course) {
    return (
      <>
        <CourseBookUI course={course} lessons={lessons} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-6 text-slate-900">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse" />
                  <BrainCircuit className="w-16 h-16 text-amber-500 animate-bounce" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold italic">
                    Building your masterpiece...
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Architecting modules and concepts
                  </p>
                </div>
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    animate={{ x: [-192, 192] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                  />
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
                <header className="space-y-2">
                  <h2 className="text-3xl font-serif font-bold tracking-tight">
                    {step === 1 && "What's the mission?"}
                    {step === 2 && "The Logistics"}
                    {step === 3 && "Fine-tuning"}
                  </h2>
                </header>

                <div className="space-y-6">
                  {step === 1 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <BookOpen size={14} /> Subject Matter
                        </label>
                        <input
                          name="subject"
                          autoFocus
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Behavioral Economics"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Current Proficiency
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Beginner", "Intermediate", "Advanced"].map(
                            (lvl) => (
                              <button
                                key={lvl}
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
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Clock size={14} /> Weekly Hours
                        </label>
                        <input
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="e.g. 5 hours"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Learning Style
                        </label>
                        <input
                          name="style"
                          value={formData.style}
                          onChange={handleChange}
                          placeholder="e.g. Visual, Practical"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Calendar size={14} /> Target Deadline
                        </label>
                        <input
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          placeholder="When do you finish?"
                          className="w-full p-5 bg-slate-50 rounded-2xl outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  {step > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-5 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={step === 3 ? handleGenerate : nextStep}
                    disabled={step === 1 && !formData.subject}
                    className="flex-2 py-5 px-6 bg-amber-500 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {step === 3 ? "Generate Curriculum" : "Continue"}
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
