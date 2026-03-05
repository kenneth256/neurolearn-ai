import React from "react";
import { StudySession } from "../components/ui/StudySession";
import { ThemeToggle } from "../components/ui/theme";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StudyPage() {
    return (
        <div className="min-h-screen bg-[#fcfcf9] dark:bg-[#020617] transition-colors duration-300">
            <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
                <StudySession />
            </main>
        </div>
    );
}
