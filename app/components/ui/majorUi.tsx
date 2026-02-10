import React from "react";
import {
  CheckCircle2,
  BookOpen,
  Target,
  Calendar,
  Link,
  Github,
  ExternalLink,
  FileText,
  Award,
} from "lucide-react";

const PreLessonCheck: React.FC<{ checks: string[] }> = ({ checks }) => {
  return (
    <div className="mb-16 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-8 rounded-r-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-lg">
          <CheckCircle2 className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-[#0f172a] dark:text-[#f8fafc]">
          Pre-Lesson Check
        </h3>
      </div>
      <ul className="space-y-3">
        {checks?.map((check, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">
              •
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {check}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PracticalApplication: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="my-16 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/50 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500 rounded-xl">
          <Target className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">
            Practical Application
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-world implementation
          </p>
        </div>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {typeof data === "string" ? (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-lg">
            {data}
          </p>
        ) : (
          <div className="space-y-4">
            {data.scenario && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.scenario}
              </p>
            )}
            {data.implementation && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.implementation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SpacedRepetition: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="my-16 bg-white dark:bg-[#0f172a] border-2 border-[#f59e0b] dark:border-[#fbbf24] rounded-3xl overflow-hidden shadow-sm">
      <div className="p-8 bg-[#f59e0b] dark:bg-[#fbbf24] text-black">
        <div className="flex items-center gap-4 mb-2">
          <Calendar size={28} className="text-black" />
          <h3 className="text-2xl font-serif font-bold italic">
            Weekly Learning Plan
          </h3>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-black/10 px-3 py-1.5 rounded border border-black/20">
            Total Hours: {data.totalHours}
          </span>
          <span className="bg-black/10 px-3 py-1.5 rounded border border-black/20">
            {data.reviewCycle}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {data.dailyBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(data.dailyBreakdown).map(
              ([days, schedule]: any) => (
                <div
                  key={days}
                  className="bg-slate-50 dark:bg-[#020617] p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-[#f59e0b] dark:text-[#fbbf24] font-mono text-[10px] font-black uppercase tracking-widest mb-2">
                    {days}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
                    {schedule}
                  </p>
                </div>
              ),
            )}
          </div>
        )}

        <div>
          <h4 className="text-[#0f172a] dark:text-[#f8fafc] font-serif text-xl font-bold mb-6 flex items-center gap-3">
            <Target size={20} className="text-[#f59e0b] dark:text-[#fbbf24]" />
            Core Tasks
          </h4>

          <div className="space-y-4">
            {data.tasks?.map((task: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-5 p-5 bg-white dark:bg-[#020617] rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded bg-[#0f172a] dark:bg-[#fbbf24] text-[#f59e0b] dark:text-black flex items-center justify-center font-mono text-xs font-black">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed pt-1">
                  {task}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExitCriteria: React.FC<{ criteria: any }> = ({ criteria }) => {
  const criteriaList = Array.isArray(criteria.criteria)
    ? criteria.criteria
    : Array.isArray(criteria)
    ? criteria
    : [criteria];

  const threshold = criteria.threshold;

  return (
    <div className="my-12 bg-[#fffbeb] dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-[#f59e0b] dark:bg-[#fbbf24] rounded-lg">
          <Target className="text-white dark:text-black" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#d97706] dark:text-[#fbbf24]">
            Exit Criteria
          </h3>
          <p className="text-xs text-[#d97706] dark:text-amber-400">
            You're ready to move on when you can...
          </p>
        </div>
        {threshold && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f59e0b] dark:bg-[#fbbf24] text-white dark:text-black rounded-lg">
            <Award size={14} />
            <span className="text-xs font-bold">{threshold}</span>
          </div>
        )}
      </div>
      <ul className="space-y-3">
        {criteriaList.map((criterion: any, idx: number) => (
          <li
            key={idx}
            className="flex items-start gap-3 p-4 bg-white dark:bg-[#0f172a] rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-colors"
          >
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#fffbeb] dark:bg-amber-900/50 flex items-center justify-center border-2 border-amber-300 dark:border-amber-700 font-bold text-[#f59e0b] dark:text-[#fbbf24] text-sm">
              {idx + 1}
            </div>
            <p className="flex-1 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {typeof criterion === "string"
                ? criterion
                : criterion.description || criterion.text || criterion}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ResourcesSection: React.FC<{ resources: any }> = ({ resources }) => {
  if (!resources) return null;

  const hasContent =
    resources.practice ||
    (resources.githubRepos && resources.githubRepos.length > 0) ||
    (resources.documentation && resources.documentation.length > 0);

  if (!hasContent) return null;

  return (
    <div className="my-12 bg-[#fffbeb] dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-[#f59e0b] dark:bg-[#fbbf24] rounded-lg">
          <BookOpen className="text-white dark:text-black" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#d97706] dark:text-[#fbbf24]">
            Additional Resources
          </h3>
          <p className="text-xs text-[#d97706] dark:text-amber-400">
            Deepen your understanding
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {resources.practice && (
          <div className="flex items-start gap-3 p-4 bg-white dark:bg-[#0f172a] rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-colors">
            <div className="p-1.5 bg-[#fffbeb] dark:bg-amber-900/50 rounded-lg shrink-0">
              <Target
                className="text-[#f59e0b] dark:text-[#fbbf24]"
                size={18}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#d97706] dark:text-[#fbbf24] mb-1.5 flex items-center gap-2 text-sm">
                <span className="text-base">🎯</span>
                Hands-On Practice
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {resources.practice}
              </p>
            </div>
          </div>
        )}

        {resources.githubRepos && resources.githubRepos.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-white dark:bg-[#0f172a] rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-colors">
            <div className="p-1.5 bg-[#fffbeb] dark:bg-amber-900/50 rounded-lg shrink-0">
              <Github
                className="text-[#f59e0b] dark:text-[#fbbf24]"
                size={18}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#d97706] dark:text-[#fbbf24] mb-2 flex items-center gap-2 text-sm">
                <span className="text-base">💻</span>
                GitHub Repositories
              </p>
              <ul className="space-y-2">
                {resources.githubRepos.map((repo: string, idx: number) => (
                  <li key={idx}>
                    <a
                      href={`https://github.com/${repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d97706] dark:text-[#fbbf24] hover:text-[#f59e0b] dark:hover:text-amber-300 hover:underline font-mono text-xs inline-flex items-center gap-1.5 transition-colors break-all"
                    >
                      <ExternalLink size={12} className="shrink-0" />
                      {repo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {resources.documentation && resources.documentation.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-white dark:bg-[#0f172a] rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-[#f59e0b] dark:hover:border-[#fbbf24] transition-colors">
            <div className="p-1.5 bg-[#fffbeb] dark:bg-amber-900/50 rounded-lg shrink-0">
              <FileText
                className="text-[#f59e0b] dark:text-[#fbbf24]"
                size={18}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#d97706] dark:text-[#fbbf24] mb-2 flex items-center gap-2 text-sm">
                <span className="text-base">📚</span>
                Official Documentation
              </p>
              <ul className="space-y-2">
                {resources.documentation.map((doc: string, idx: number) => (
                  <li key={idx}>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d97706] dark:text-[#fbbf24] hover:text-[#f59e0b] dark:hover:text-amber-300 hover:underline text-xs inline-flex items-start gap-1.5 transition-colors break-all"
                    >
                      <ExternalLink size={12} className="shrink-0 mt-0.5" />
                      <span className="flex-1">{doc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export {
  PreLessonCheck,
  PracticalApplication,
  ResourcesSection,
  SpacedRepetition,
  ExitCriteria,
};

export default ResourcesSection;
