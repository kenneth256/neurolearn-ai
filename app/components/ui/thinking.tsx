import React, { useState, useEffect } from "react";

const ThinkingIndicator: React.FC = () => {
  const thoughts = [
    "Analyzing lesson context...",
    "Synthesizing Gemini 3 logic...",
    "Structuring explanation...",
    "Refining pedagogical approach...",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % thoughts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-slate-400 italic">
          {thoughts[index]}
        </span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
