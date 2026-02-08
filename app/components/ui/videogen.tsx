import React from "react";
import { useVideoGenerator } from "@/app/hooks/usevideogen";
import {
  Film,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";

interface VideoGeneratorSimpleProps {
  contentContext?: any;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: number;
}

export default function VideoGeneratorSimple({
  contentContext,
  aspectRatio = "16:9",
  duration = 5,
}: VideoGeneratorSimpleProps) {
  const {
    prompt,
    setPrompt,
    videos,
    loading,
    generatingPrompt,
    error,
    generatePrompt,
    generateVideo,
  } = useVideoGenerator({ autoExtractContent: true });

  const handleGeneratePrompt = async () => {
    await generatePrompt(contentContext);
  };

  const handleGenerateVideo = async () => {
    if (prompt) {
      await generateVideo(prompt, { aspectRatio, duration });
    }
  };

  const handleDownload = (videoUrl: string) => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `lesson-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 rounded-2xl shadow-2xl p-10 space-y-8 border-2 border-amber-200/50 dark:border-amber-900/30 relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-tr-full" />

      {/* Header */}
      <div className="flex items-start gap-4 relative">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <Film className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Cinematic Video Generator
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Transform your lesson content into engaging visual narratives
          </p>
        </div>
      </div>

      {/* Generate Prompt Section */}
      {!prompt && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-gray-900 dark:text-white mb-1">
                  AI-Powered Analysis
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Our AI will analyze your lesson content and craft a compelling
                  cinematic video prompt tailored to maximize learning
                  engagement.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGeneratePrompt}
            disabled={generatingPrompt}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-8 rounded-xl font-serif font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 border-2 border-amber-400/50 group"
          >
            {generatingPrompt ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-base">Analyzing Content...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-base">
                  Generate Video Prompt from Page
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Edit Prompt & Generate Video Section */}
      {prompt && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-serif font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Video Prompt
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {prompt.length} characters
              </span>
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-5 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-600 transition-all resize-none shadow-sm font-medium leading-relaxed"
                rows={6}
                placeholder="Describe the video you want to create..."
              />
              <div className="absolute bottom-3 right-3">
                <div className="bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Pro tip:
                </span>{" "}
                You can refine this prompt to adjust the style, pacing, or
                visual elements before generating your video.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateVideo}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 text-white py-4 px-8 rounded-xl font-serif font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 border-2 border-slate-600 dark:border-slate-600 group"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-base">Creating Your Video...</span>
              </>
            ) : (
              <>
                <Film className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-base">Generate Video</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-6 py-5 rounded-xl flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-serif font-bold text-base mb-1">
              Generation Failed
            </p>
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Generated Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-6 pt-8 border-t-2 border-amber-200 dark:border-amber-900/30 relative">
          {/* Success header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                Video Generated Successfully
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your cinematic learning video is ready to view
              </p>
            </div>
          </div>

          {videos.map((video, index) => (
            <div key={index} className="space-y-5">
              {/* Video player */}
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl ring-4 ring-slate-200 dark:ring-slate-700">
                <video
                  src={video.url}
                  controls
                  className="w-full"
                  autoPlay
                  loop
                  muted
                />
                {/* Video overlay decoration */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white text-xs font-mono font-semibold uppercase tracking-wider">
                    Lesson Video
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload(video.url)}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3.5 px-5 rounded-xl font-serif font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 border-2 border-emerald-500"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setPrompt("");
                    videos.length = 0;
                  }}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-3.5 px-5 rounded-xl font-serif font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Video</span>
                </button>
              </div>

              {/* Video info card */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold">Created with AI.</span>{" "}
                      This video was generated based on your lesson content to
                      enhance visual learning and engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
