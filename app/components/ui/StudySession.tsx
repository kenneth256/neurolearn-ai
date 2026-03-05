"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In a real app, the API would join the ReviewItem with the actual Concept from the CourseModule.
    // However, our new AI Auto-Deck generator injects the text string directly into the ConceptId.

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
                setIsFlipped(false); // Reset flip state for the next card
                setSubmitting(false);
            }, 400); // Small delay for the animation

        } catch (err: any) {
            console.error(err);
            setError("Failed to save progress. Please try again.");
            setSubmitting(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If we are loading, submitting, or finished, ignore keystrokes
            if (loading || submitting || currentIndex >= queue.length) return;

            // SAFEGUARD: Ignore shortcuts if the user is typing in an input, textarea, or contenteditable
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            // Prevent default scrolling for Spacebar when studying
            if (e.code === "Space") {
                e.preventDefault();
            }

            // Flip Card: Space or Enter
            if (e.code === "Space" || e.key === "Enter") {
                setIsFlipped((prev) => !prev);
                return;
            }

            // Rate Card: 1, 2, 3, 4 (only if flipped)
            if (isFlipped) {
                switch (e.key) {
                    case "1": handleRate(0); break; // Again
                    case "2": handleRate(2); break; // Hard
                    case "3": handleRate(4); break; // Good
                    case "4": handleRate(5); break; // Easy
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFlipped, loading, submitting, currentIndex, queue.length]);

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
                <div className="w-16 h-16 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-8 bg-white dark:bg-slate-950 shadow-sm">
                    <CheckCircle2 size={32} className="text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-serif text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
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
                <div className="w-16 h-16 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-8 bg-white dark:bg-slate-950 shadow-sm">
                    <Sparkles size={32} className="text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-serif text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
                    You're all caught up!
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    No pending flashcards for today. Relax, or start a new module to learn more concepts.
                </p>
            </div>
        );
    }

    // Active Flashcard State
    // Pillar 1: Parse the JSON string stored in conceptId (Format: {term, def, analogy})
    let parsedConcept = { term: "Concept", def: currentItem.conceptId, analogy: "" };
    try {
        if (currentItem.conceptId.startsWith("{")) {
            parsedConcept = JSON.parse(currentItem.conceptId);
        } else {
            // Fallback for older string data
            parsedConcept.term = currentItem.conceptId.length > 50
                ? currentItem.conceptId.substring(0, 50) + "..."
                : currentItem.conceptId;
        }
    } catch (e) {
        // Safe fallback
        parsedConcept.term = "Concept";
    }

    const conceptDetails = {
        term: parsedConcept.term,
        def: parsedConcept.def || currentItem.conceptId,
        analogy: parsedConcept.analogy || "Think about how this connects to the broader lesson topic.",
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            {/* Progress Bar Header */}
            <div className="flex items-center justify-between mb-12 px-2">
                <div>
                    <h2 className="text-lg font-serif text-slate-800 dark:text-slate-200 tracking-tight">
                        {currentItem.enrollment?.course?.subject || "Daily Review"}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-1">
                        Card {currentIndex + 1} of {queue.length}
                    </p>
                </div>
                <div className="w-32 md:w-48 h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(currentIndex / queue.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* The Flashcard */}
            <div className="mb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Flashcard
                            term={conceptDetails.term}
                            definition={conceptDetails.def}
                            analogy={conceptDetails.analogy}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Keyboard Hint (shows before flipping) */}
            {!isFlipped && (
                <div className="text-center text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest mt-8 animate-pulse">
                    Press <kbd className="px-2 py-1 mx-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 shadow-sm">Space</kbd> to flip
                </div>
            )}

            {/* Spaced Repetition Rating Buttons (shows after flip) */}
            {isFlipped && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
                    <SpacedRepetitionControls
                        onRate={handleRate}
                        disabled={submitting}
                    />
                </div>
            )}
        </div>
    );
};
