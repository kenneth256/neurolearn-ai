"use client";

import React, { useEffect, useState } from "react";
import { BrainCircuit, Loader2, CheckCircle2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface ReviewItem {
    id: string;
    conceptId: string;
    dueDate: string;
    repetitionCount: number;
    enrollment: {
        course: {
            title: string;
        }
    };
}

export const DailyReviewWidget = () => {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/spaced-repetition/pending", {
                headers: {
                    "Content-Type": "application/json",
                    // Send auth token if logic requires it via localStorage
                    ...(localStorage.getItem("token") && { Authorization: `Bearer ${localStorage.getItem("token")}` }),
                }
            });
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (e) {
            console.error("Failed to load daily reviews", e);
        } finally {
            setLoading(false);
        }
    };

    const handleStartReview = () => {
        if (reviews.length > 0) setActiveReview(reviews[0]);
    };

    const submitReviewQuality = async (quality: number) => {
        if (!activeReview) return;

        setIsEvaluating(true);
        try {
            const res = await fetch("/api/spaced-repetition/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewItemId: activeReview.id, quality }),
            });

            if (res.ok) {
                toast.success("Review logged! Memory strengthened.");
                // Pop the first item off and either show next or close
                const remaining = reviews.slice(1);
                setReviews(remaining);
                setActiveReview(remaining.length > 0 ? remaining[0] : null);
            } else {
                toast.error("Failed to submit review");
            }
        } catch (e) {
            toast.error("Error connecting to server");
        } finally {
            setIsEvaluating(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-slate-900/5 dark:bg-slate-100/5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[120px]">
                <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
        );
    }

    if (reviews.length === 0) {
        return null; // System optimal, no reviews needed. Hide widget.
    }

    return (
        <div className="mb-8 w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-800/50 shadow-sm relative overflow-hidden">

            {/* Decorative Background Icon */}
            <BrainCircuit className="absolute -right-8 -bottom-8 w-48 h-48 text-amber-500/10 dark:text-amber-500/5 object-cover" />

            <div className="relative z-10">
                {!activeReview ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BrainCircuit size={20} className="text-amber-600 dark:text-amber-500" />
                                <h3 className="font-serif font-bold text-xl text-amber-900 dark:text-amber-100">
                                    Daily Cognitive Sync Required
                                </h3>
                            </div>
                            <p className="text-amber-700/80 dark:text-amber-200/60 font-medium text-sm">
                                Neurolearn's predictive engine detected that you are about to forget {reviews.length} concept{reviews.length > 1 ? 's' : ''}.
                            </p>
                        </div>

                        <button
                            onClick={handleStartReview}
                            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-serif font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
                        >
                            Start 2-Min Review
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeReview.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-center border-b border-amber-200/50 dark:border-amber-800/30 pb-4">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold block mb-1">
                                        Remember this concept?
                                    </span>
                                    <h4 className="text-lg font-serif font-bold text-gray-900 dark:text-white">
                                        From Course: {activeReview.enrollment.course.title}
                                    </h4>
                                    <p className="text-sm font-mono mt-1 text-slate-500">
                                        Internal Ref: {activeReview.conceptId}
                                    </p>
                                </div>
                                <div className="text-sm text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-lg">
                                    {reviews.length} remaining
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-amber-800 dark:text-amber-200/70 mb-3 font-medium">
                                    How well did you recall this information? Be honest, the algorithm adapts to you.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { val: 0, label: "Total Blackout" },
                                        { val: 2, label: "Struggled" },
                                        { val: 4, label: "Remembered" },
                                        { val: 5, label: "Trivial / Too Easy" }
                                    ].map(btn => (
                                        <button
                                            key={btn.val}
                                            disabled={isEvaluating}
                                            onClick={() => submitReviewQuality(btn.val)}
                                            className={`
                        py-3 px-4 rounded-xl text-sm font-bold border transition-all text-center
                        ${btn.val >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' : ''}
                        ${btn.val === 2 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400' : ''}
                        ${btn.val === 0 ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400' : ''}
                        disabled:opacity-50
                      `}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
