"use client";
import React from "react";

export interface SpacedRepetitionControlsProps {
    onRate: (quality: number) => void;
    disabled?: boolean;
}

export const SpacedRepetitionControls: React.FC<SpacedRepetitionControlsProps> = ({
    onRate,
    disabled = false,
}) => {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 grid grid-cols-4 gap-2 md:gap-4">
            <button
                disabled={disabled}
                onClick={() => onRate(0)}
                className="relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
                <div className="absolute top-2 left-2 hidden md:flex items-center justify-center w-5 h-5 rounded bg-red-200 dark:bg-red-900/60 text-[10px] font-bold text-red-800 dark:text-red-300">1</div>
                <span className="text-sm md:text-base font-bold mb-1">Again</span>
                <span className="text-[10px] md:text-xs opacity-70">&lt; 1 min</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(2)}
                className="relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-50"
            >
                <div className="absolute top-2 left-2 hidden md:flex items-center justify-center w-5 h-5 rounded bg-orange-200 dark:bg-orange-900/60 text-[10px] font-bold text-orange-800 dark:text-orange-300">2</div>
                <span className="text-sm md:text-base font-bold mb-1">Hard</span>
                <span className="text-[10px] md:text-xs opacity-70">~ 2 days</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(4)}
                className="relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
            >
                <div className="absolute top-2 left-2 hidden md:flex items-center justify-center w-5 h-5 rounded bg-emerald-200 dark:bg-emerald-900/60 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">3</div>
                <span className="text-sm md:text-base font-bold mb-1">Good</span>
                <span className="text-[10px] md:text-xs opacity-70">~ 4 days</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(5)}
                className="relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
            >
                <div className="absolute top-2 left-2 hidden md:flex items-center justify-center w-5 h-5 rounded bg-blue-200 dark:bg-blue-900/60 text-[10px] font-bold text-blue-800 dark:text-blue-300">4</div>
                <span className="text-sm md:text-base font-bold mb-1">Easy</span>
                <span className="text-[10px] md:text-xs opacity-70">~ 7 days</span>
            </button>
        </div>
    );
};
