"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

/**
 * Inline script in <head> — runs synchronously before first paint.
 * Applies dark class immediately so there's no flash on load.
 */
export const ThemeScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{
        var s=localStorage.getItem('theme');
        var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;
        if(s==='dark'||(s===null&&sys)){
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }catch(e){}})();`,
    }}
  />
);

/** Apply a theme directly to the DOM + persist it — safe to call anywhere */
function applyTheme(next: Theme) {
  if (next === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", next);
  } catch (_e) { }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Start with "light" — ThemeScript has already painted the page correctly,
  // so this initial value is only used for React state; no visual flash occurs.
  const [theme, setTheme] = useState<Theme>("light");

  // On mount: read what ThemeScript actually applied and sync React state.
  // We do NOT apply the theme here (ThemeScript already did it).
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = saved === "dark" || saved === "light"
      ? saved
      : sys ? "dark" : "light";
    setTheme(initial);
    // Ensure DOM matches (handles edge-cases like SSR mismatch)
    applyTheme(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // Toggle: update DOM synchronously then update React state.
  // DOM-first means the visual change is instant, not delayed by a re-render cycle.
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next); // ← synchronous DOM write, happens before React re-renders
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative w-10 h-10 flex items-center justify-center rounded-full
        border border-slate-200 dark:border-slate-700
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        shadow-sm hover:shadow-md
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
        ${className}
      `}
    >
      <Moon
        size={18}
        className={`absolute transition-all duration-200 text-slate-600
          ${isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}
        `}
      />
      <Sun
        size={18}
        className={`absolute transition-all duration-200 text-amber-400
          ${isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}
        `}
      />
    </button>
  );
};