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
      console.log("Starting course generation with:", formData);

      const results = await generateCourse(formData);

      console.log("AI generation results:", results);

      if (!results?.data) {
        throw new Error("AI generation failed - no data returned.");
      }

      if (!results.data.success) {
        throw new Error(results.data.error || "AI generation failed.");
      }

      if (!results.data.course) {
        throw new Error("AI returned no course data.");
      }

      let modules: any[];
      try {
        const jsonText = results.data.course.trim();
        console.log(
          "Parsing AI response, first 200 chars:",
          jsonText.substring(0, 200),
        );

        const parsed = JSON.parse(jsonText);

        if (Array.isArray(parsed)) {
          modules = parsed;
        } else if (parsed.modules && Array.isArray(parsed.modules)) {
          modules = parsed.modules;
        } else {
          console.error("Unexpected structure:", parsed);
          throw new Error("AI returned unexpected structure.");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error(
          "Raw AI response:",
          results.data.course.substring(0, 500),
        );
        throw new Error("AI returned invalid JSON format.");
      }

      if (!modules || modules.length === 0) {
        throw new Error("AI returned no valid modules.");
      }

      console.log(`Successfully parsed ${modules.length} modules`);

      // Step 3: Save to database
      const savePayload = {
        title: formData.subject,
        description: formData.goals,
        subject: formData.subject,
        level: formData.level,
        goals: formData.goals,
        generationParams: { modules },
      };

      console.log("Saving to database:", savePayload);

      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(savePayload),
      });

      const saveResponseText = await response.text();
      console.log("Database save response:", saveResponseText);

      if (!response.ok) {
        let errorMessage = "Failed to save course to database.";
        try {
          const errorData = JSON.parse(saveResponseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = saveResponseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(saveResponseText);
      } catch (parseError) {
        console.error("Failed to parse save response:", saveResponseText);
        throw new Error("Failed to parse database response.");
      }

      if (!data.success) {
        throw new Error(data.message || "Database operation failed.");
      }

      const courseId = data?.data?.id;
      if (!courseId) {
        throw new Error("Course was created but no ID was returned.");
      }

      console.log("Course saved successfully with ID:", courseId);

      window.location.href = `/courses/${courseId}`;
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
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-xl">
        {!loading && (
          <div className="flex justify-center gap-2 mb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === i ? "w-8 bg-amber-500" : "w-2 bg-stone-300"
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-[#fefefe] border border-stone-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,69,19,0.08)] p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] pointer-events-none rounded-[2.5rem]" />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center space-y-6"
              >
                <BrainCircuit className="w-16 h-16 text-amber-600 animate-pulse" />
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold italic text-amber-900">
                    Building your masterpiece...
                  </h3>
                  <p className="text-sm text-stone-500 mt-2">
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
                className="space-y-8 relative"
              >
                <h2 className="text-3xl font-serif font-bold tracking-tight text-amber-950">
                  {step === 1 && "What's the mission?"}
                  {step === 2 && "The Logistics"}
                  {step === 3 && "Fine-tuning"}
                </h2>

                <div className="space-y-6">
                  {step === 1 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <BookOpen size={14} className="text-amber-600" />{" "}
                          Subject Matter
                        </label>
                        <input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Quantum Physics"
                          className="w-full p-5 bg-amber-50/30 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500">
                          Proficiency
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(
                            ["Beginner", "Intermediate", "Advanced"] as const
                          ).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, level: lvl }))
                              }
                              className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                                formData.level === lvl
                                  ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200"
                                  : "bg-white border-stone-200 text-stone-600 hover:border-amber-300"
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
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <Target size={14} className="text-amber-600" />{" "}
                          Learning Goal
                        </label>
                        <textarea
                          name="goals"
                          value={formData.goals}
                          onChange={handleChange}
                          rows={3}
                          placeholder="What do you want to achieve?"
                          className="w-full p-5 bg-amber-50/30 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900 resize-none placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <Clock size={14} className="text-amber-600" /> Time
                          Commitment
                        </label>
                        <input
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          placeholder="e.g. 10 hours total"
                          className="w-full p-5 bg-amber-50/30 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-stone-400"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-600" />{" "}
                          Learning Style
                        </label>
                        <input
                          name="style"
                          value={formData.style}
                          onChange={handleChange}
                          placeholder="e.g. Practical, Visual"
                          className="w-full p-5 bg-amber-50/30 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                          <Calendar size={14} className="text-amber-600" />{" "}
                          Deadline
                        </label>
                        <input
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          placeholder="Target completion date"
                          className="w-full p-5 bg-amber-50/30 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-900 placeholder:text-stone-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 flex gap-4">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="flex-1 py-5 rounded-2xl font-bold border-2 border-stone-200 text-stone-700 hover:bg-amber-50/50 hover:border-amber-300 transition-all"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={
                      step === 3 ? handleGenerate : () => setStep((s) => s + 1)
                    }
                    disabled={step === 1 && !formData.subject}
                    className="flex-[2] py-5 px-6 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {step === 3 ? "Generate Curriculum" : "Continue"}{" "}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mt-8 text-xs text-stone-400 font-serif italic">
          Personalized learning, powered by AI
        </div>
      </div>
    </div>
  );
};

export default Page;
