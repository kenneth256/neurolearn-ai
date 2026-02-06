"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
              Sign In
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back to your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter hover:text-amber-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-gray-900 dark:bg-amber-500 text-white dark:text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-50 dark:border-gray-800 pt-6">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              New to the platform?{" "}
              <Link
                href="/register"
                className="font-bold text-amber-600 hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Sparkles size={14} />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              Secure AI Portal
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
