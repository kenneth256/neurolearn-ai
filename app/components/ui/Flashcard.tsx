"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Lightbulb, GraduationCap } from "lucide-react";

export interface FlashcardProps {
    term: string;
    definition: string;
    analogy?: string;
    example?: string;
    isFlipped: boolean;
    onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
    term,
    definition,
    analogy,
    example,
    isFlipped,
    onFlip,
}) => {
    return (
        <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto perspective-1000">
            <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={onFlip}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all">
                    <GraduationCap className="text-amber-500 mb-6 opacity-30" size={48} />
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-center text-slate-800 dark:text-slate-100">
                        {term}
                    </h2>
                    <div className="absolute bottom-6 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-widest">
                        <RotateCcw size={16} />
                        <span>Click to flip</span>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-[#0f172a] border-2 border-amber-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col shadow-xl overflow-y-auto"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-center mb-8">
                            {definition}
                        </h3>

                        {analogy && (
                            <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-amber-100 dark:border-slate-800 mb-4">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-xs uppercase tracking-widest font-bold mb-2">
                                    <Lightbulb size={16} /> Analogy
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 italic">"{analogy}"</p>
                            </div>
                        )}

                        {example && (
                            <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">
                                    Example
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">{example}</p>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-widest">
                        <RotateCcw size={16} />
                        <span>Click to flip back</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
