"use client";

import { useMasteryProgression, useStruggleAnalysis } from "@/app/hooks/useAnalyseHook";
import React from "react";


// ============================================
// STRUGGLE ANALYSIS COMPONENT
// ============================================

interface StruggleAnalysisProps {
  userId: string;
}

export function StruggleAnalysisComponent({ userId }: StruggleAnalysisProps) {
  const { data, loading, error } = useStruggleAnalysis(userId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Struggle Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Areas to Improve</h2>
        {data.topStruggleAreas.length === 0 ? (
          <p className="text-gray-500">
            No struggle areas identified yet. Keep learning!
          </p>
        ) : (
          <div className="space-y-3">
            {data.topStruggleAreas.map((area, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{area.topic}</h3>
                    <p className="text-sm text-gray-600">
                      Struggled {area.frequency} times • Avg score:{" "}
                      {Math.round(area.averageScore)}%
                    </p>
                  </div>
                  <TrendBadge trend={area.trend} />
                </div>

                {area.relatedLessons.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Related lessons:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {area.relatedLessons.slice(0, 3).map((lesson, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {lesson}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Improvement Areas */}
      {data.improvementAreas.length > 0 && (
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <h2 className="text-2xl font-bold mb-4 text-green-900">
            🎉 Areas of Improvement
          </h2>
          <div className="space-y-3">
            {data.improvementAreas.map((area, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <h3 className="font-semibold">{area.topic}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    {Math.round(area.previousScore)}% →{" "}
                    {Math.round(area.currentScore)}%
                  </span>
                  <span className="text-green-600 font-semibold">
                    +{Math.round(area.improvement)}% improvement
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-900">
            💡 Recommendations
          </h2>
          <div className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <PriorityBadge priority={rec.priority} />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{rec.title}</h3>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MASTERY PROGRESSION COMPONENT
// ============================================

interface MasteryProgressionProps {
  enrollmentId: string;
}

export function MasteryProgressionComponent({
  enrollmentId,
}: MasteryProgressionProps) {
  const { data, loading, error } = useMasteryProgression(enrollmentId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Overall Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Mastery Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-1">Trend</p>
            <p className="text-2xl font-bold capitalize">
              {data.overallTrend.direction}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-1">Avg Improvement</p>
            <p className="text-2xl font-bold">
              +{Math.round(data.overallTrend.averageImprovementRate)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-1">Consistency</p>
            <p className="text-2xl font-bold">
              {Math.round(data.overallTrend.consistencyScore)}%
            </p>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.strengths.length > 0 && (
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <h3 className="text-xl font-bold mb-3 text-green-900">
              💪 Strengths
            </h3>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.weaknesses.length > 0 && (
          <div className="bg-orange-50 rounded-lg shadow p-6 border border-orange-200">
            <h3 className="text-xl font-bold mb-3 text-orange-900">
              📚 Focus Areas
            </h3>
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-orange-600">→</span>
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Module Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Module Progress</h3>
        <div className="space-y-4">
          {data.modules.map((module) => (
            <div
              key={module.moduleId}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  Module {module.moduleNumber}: {module.moduleName}
                </h4>
                <StatusBadge status={module.status} />
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Mastery Score</span>
                    <span className="font-semibold">
                      {Math.round(module.currentMasteryScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${module.currentMasteryScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {module.attemptHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Attempts: {module.attemptHistory.length} • Progress:{" "}
                    {module.progression > 0 ? "+" : ""}
                    {Math.round(module.progression)}%
                  </p>
                  <div className="flex gap-1">
                    {module.attemptHistory.map((attempt, i) => (
                      <div
                        key={i}
                        className="h-8 flex-1 bg-gray-100 rounded relative group"
                        style={{
                          backgroundColor: `hsl(${attempt.score * 1.2}, 70%, ${50 + attempt.score / 4}%)`,
                        }}
                        title={`${Math.round(attempt.score)}% - ${new Date(attempt.date).toLocaleDateString()}`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow">
                          {Math.round(attempt.score)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// UTILITY COMPONENTS
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Error: {error}</p>
    </div>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  const colors = {
    improving: "bg-green-100 text-green-800",
    declining: "bg-red-100 text-red-800",
    stable: "bg-gray-100 text-gray-800",
  };

  const icons = {
    improving: "↗",
    declining: "↘",
    stable: "→",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[trend as keyof typeof colors]}`}
    >
      {icons[trend as keyof typeof icons]} {trend}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority as keyof typeof colors]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    LOCKED: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    MASTERED: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}


