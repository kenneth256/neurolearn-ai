"use client";
import React, { useState, useEffect } from "react";
import { Flashcard } from "./Flashcard";
import { SpacedRepetitionControls } from "./SpacedRepetitionControls";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface ReviewItem {
    id: string;
    conceptId: string;
    dueDate: string;
    completed: boolean;
    enrollment: {
        course: {
            title: string;
            subject: string;
        };
    };
}

export const StudySession: React.FC = () => {
    const [queue, setQueue] = useState<ReviewItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // MOCK DATA FOR CONCEPT EXPLANATIONS (Since our DB just stores conceptId)
    // In a real app, the API would join the ReviewItem with the actual Concept from the CourseModule
    const mockConceptDictionary: Record<string, { term: string; def: string; analogy: string }> = {
        "concept-1": {
            term: "Gradient Descent",
            def: "An optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent.",
            analogy: "Like walking down a mountain blindfolded, taking steps in the direction that slopes downward the most.",
        },
        // We will use a fallback for any unknown ids during testing
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/spaced-repetition/pending");
            if (!res.ok) throw new Error("Failed to load reviews");

            const json = await res.json();
            setQueue(json.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentItem = queue[currentIndex];

    const handleRate = async (quality: number) => {
        if (!currentItem) return;

        try {
            setSubmitting(true);

            // Post the review back to the SM-2 engine
            const res = await fetch("/api/spaced-repetition/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewItemId: currentItem.id,
                    quality,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit review");

            // Move to next card
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setSubmitting(false);
            }, 400); // Small delay for the animation

        } catch (err: any) {
            console.error(err);
            setError("Failed to save progress. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
                <p className="text-slate-500 font-medium">Loading your daily review deck...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl p-8 text-center max-w-lg mx-auto">
                <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error}</p>
                <button
                    onClick={fetchPendingReviews}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Session Complete State
    if (currentIndex >= queue.length && queue.length > 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Review Complete!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    You mastered {queue.length} concepts today. Building that daily streak!
                </p>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-xl"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Empty State (No reviews due)
    if (queue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={40} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
                    You're all caught up!
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    No pending flashcards for today. Relax, or start a new module to learn more concepts.
                </p>
            </div>
        );
    }

    // Active Flashcard State
    const conceptDetails = mockConceptDictionary[currentItem.conceptId] || {
        term: `Concept: ${currentItem.conceptId.split('-')[0] || 'Unknown'}`,
        def: "Definition pending: This concept was loaded from the SM-2 database but lacks detailed text in the mock dictionary.",
        analogy: "Think of this as a placeholder waiting for Real data.",
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            {/* Progress Bar Header */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200">
                        {currentItem.enrollment?.course?.subject || "Daily Review"}
                    </h2>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mt-1">
                        Card {currentIndex + 1} of {queue.length}
                    </p>
                </div>
                <div className="w-32 md:w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(currentIndex / queue.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* The Flashcard */}
            <div className="mb-12">
                <Flashcard
                    term={conceptDetails.term}
                    definition={conceptDetails.def}
                    analogy={conceptDetails.analogy}
                />
            </div>

            {/* Spaced Repetition Rating Buttons */}
            <div className="opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-forwards">
                <SpacedRepetitionControls
                    onRate={handleRate}
                    disabled={submitting}
                />
            </div>
        </div>
    );
};
