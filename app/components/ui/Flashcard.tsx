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
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all group">
                    <GraduationCap className="text-slate-300 dark:text-slate-700 mb-8 transition-transform group-hover:scale-110 duration-500" size={40} strokeWidth={1.5} />
                    <h2 className="text-4xl md:text-5xl font-serif text-center text-slate-800 dark:text-slate-200 tracking-tight">
                        {term}
                    </h2>
                    <div className="absolute bottom-8 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <RotateCcw size={14} />
                        <span>Flip</span>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 backface-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col shadow-sm overflow-y-auto"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                        <h3 className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed mb-10 text-center">
                            {definition}
                        </h3>

                        {analogy && (
                            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-6 py-2 mb-6">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
                                    <Lightbulb size={14} /> Analogy
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">"{analogy}"</p>
                            </div>
                        )}

                        {example && (
                            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-6 py-2">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
                                    Example
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-mono text-sm leading-relaxed">{example}</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
