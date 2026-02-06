"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        // Handle general error message
        throw new Error(data.message || "Something went wrong");
      }

      // Store JWT token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Redirect to dashboard or login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-amber-500 rounded-xl text-black shadow-sm">
              <BrainCircuit size={28} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                NeuronLearn
              </span>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 -mt-1">
                AI Education
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Start your personalized AI journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 ml-1">
                    {fieldErrors.firstName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                  value={formData.secondName}
                  onChange={(e) =>
                    setFormData({ ...formData, secondName: e.target.value })
                  }
                />
                {fieldErrors.secondName && (
                  <p className="text-xs text-red-500 ml-1">
                    {fieldErrors.secondName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                placeholder="jane@example.com"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 ml-1">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 ml-1">
                  {fieldErrors.password[0]}
                </p>
              )}
              <p className="text-[10px] text-gray-400 ml-1 mt-1">
                Min 8 chars with uppercase, lowercase & number
              </p>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gray-900 dark:bg-amber-500 text-white dark:text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-50 dark:border-gray-800 pt-6">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-amber-600 hover:underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Sparkles size={14} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Secure AI Registration
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
