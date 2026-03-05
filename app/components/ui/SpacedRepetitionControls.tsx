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
        <div className="w-full max-w-2xl mx-auto mt-8 grid grid-cols-4 gap-3 md:gap-4">
            <button
                disabled={disabled}
                onClick={() => onRate(0)}
                className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-sm disabled:opacity-50 group"
            >
                <div className="absolute top-3 left-3 hidden md:flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">1</div>
                <span className="text-sm md:text-base font-semibold mb-1 text-slate-800 dark:text-slate-200">Again</span>
                <span className="text-[10px] md:text-xs">1m</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(2)}
                className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-sm disabled:opacity-50 group"
            >
                <div className="absolute top-3 left-3 hidden md:flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">2</div>
                <span className="text-sm md:text-base font-semibold mb-1 text-slate-800 dark:text-slate-200">Hard</span>
                <span className="text-[10px] md:text-xs">2d</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(4)}
                className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-sm disabled:opacity-50 group"
            >
                <div className="absolute top-3 left-3 hidden md:flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">3</div>
                <span className="text-sm md:text-base font-semibold mb-1 text-slate-800 dark:text-slate-200">Good</span>
                <span className="text-[10px] md:text-xs">4d</span>
            </button>

            <button
                disabled={disabled}
                onClick={() => onRate(5)}
                className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-sm disabled:opacity-50 group"
            >
                <div className="absolute top-3 left-3 hidden md:flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">4</div>
                <span className="text-sm md:text-base font-semibold mb-1 text-slate-800 dark:text-slate-200">Easy</span>
                <span className="text-[10px] md:text-xs">7d</span>
            </button>
        </div>
    );
};
