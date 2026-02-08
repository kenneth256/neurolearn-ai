"use client";

import { useState } from "react";
import { Brain, Loader2, CheckCircle } from "lucide-react";

interface AdaptiveQuizGeneratorProps {
  enrollmentId: string;
  lessonModuleId?: string;
  courseModuleId?: string;
  currentMood?: any;
}

export default function AdaptiveQuizGenerator({
  enrollmentId,
  lessonModuleId,
  courseModuleId,
  currentMood,
}: AdaptiveQuizGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/adaptive-quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          lessonModuleId,
          courseModuleId,
          moodContext: currentMood,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const result = await response.json();
      setGeneratedQuiz(result.data);
    } catch (err: any) {
      setError(err.message || "Failed to generate adaptive quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      VERY_EASY: "bg-green-100 text-green-800",
      EASY: "bg-blue-100 text-blue-800",
      MODERATE: "bg-yellow-100 text-yellow-800",
      CHALLENGING: "bg-orange-100 text-orange-800",
      HARD: "bg-red-100 text-red-800",
      EXPERT: "bg-purple-100 text-purple-800",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-600" />
        AI-Adaptive Quiz
      </h3>

      {currentMood && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg text-sm">
          <p className="text-purple-900">
            Based on your <strong>{currentMood.mood.toLowerCase()}</strong>{" "}
            state, we'll customize the quiz difficulty and content for you.
          </p>
        </div>
      )}

      <button
        onClick={generateQuiz}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating personalized quiz...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            Generate Adaptive Quiz
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {generatedQuiz && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-600 font-medium">Quiz Generated!</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Quiz Details</h4>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(generatedQuiz.difficultyLevel)}`}
              >
                {generatedQuiz.difficultyLevel.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Questions</p>
                <p className="font-semibold">{generatedQuiz.totalQuestions}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-semibold">
                  {generatedQuiz.estimatedDuration} min
                </p>
              </div>
            </div>

            {generatedQuiz.adaptationReason && (
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">
                  <strong>Adapted because:</strong>{" "}
                  {generatedQuiz.adaptationReason.replace("_", " ")}
                </p>
              </div>
            )}

            <button
              onClick={() =>
                (window.location.href = `/quiz/${generatedQuiz.id}`)
              }
              className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
