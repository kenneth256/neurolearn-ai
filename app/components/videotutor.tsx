import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Video,
  Play,
  Film,
  Sparkles,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface VideoTutorModalProps {
  showVideoTutor: boolean;
  isGeneratingVideo: boolean;
  currentVideoUrl: string;
  videoScript?: string;
  lessonContent?: any;
  userId: string;
  onClose: () => void;
  onReplayAudio?: () => void;
}

interface VideoGenerationStatus {
  status: string;
  progress: number;
  compiledVideo?: {
    finalVideoUrl: string;
    thumbnailUrl: string;
    totalDuration: number;
  };
}

const VideoTutorModal: React.FC<VideoTutorModalProps> = ({
  showVideoTutor,
  isGeneratingVideo,
  currentVideoUrl,
  videoScript,
  lessonContent,
  userId,
  onClose,
  onReplayAudio,
}) => {
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>("");
  const [promptId, setPromptId] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleGenerateVideo = async () => {
    if (!lessonContent || !userId) {
      setError("Missing lesson content or user ID");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGenerationProgress(0);
    setGenerationStatus("Analyzing content...");

    try {
      const promptResponse = await fetch("/api/ai/videoprop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            pageContent: videoScript,
            lessonData: lessonContent,
            userId,
          },
        }),
      });

      const promptData = await promptResponse.json();

      if (!promptData.success) {
        throw new Error(promptData.error || "Failed to generate prompt");
      }

      setPromptId(promptData.promptId);
      setGenerationProgress(20);
      setGenerationStatus("Creating video segments...");

      const jobResponse = await fetch("/api/video/generateAsync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: promptData.promptId,
          userId,
        }),
      });

      const jobData = await jobResponse.json();

      if (!jobData.success) {
        throw new Error(jobData.error || "Failed to queue video generation");
      }

      pollJobStatus(promptData.promptId);
    } catch (err) {
      console.error("Video generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate video");
      setIsGenerating(false);
    }
  };

  const pollJobStatus = async (pId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/video/status/${pId}`);
        const statusData: VideoGenerationStatus = await statusResponse.json();

        if (statusData.status === "completed") {
          clearInterval(pollInterval);
          setGenerationProgress(100);
          setGenerationStatus("Video ready!");
          const videoResponse = await fetch(`/api/video/status/${pId}`);
          const videoData = await videoResponse.json();
          if (videoData.status?.compiledVideo) {
            setGeneratedVideoUrl(videoData.status.compiledVideo.finalVideoUrl);
          }
          setIsGenerating(false);
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval);
          setError("Video generation failed");
          setIsGenerating(false);
        } else if (statusData.status === "active") {
          const progress = statusData.progress || 0;
          setGenerationProgress(progress);
          if (progress < 30) {
            setGenerationStatus("Generating video clips...");
          } else if (progress < 80) {
            setGenerationStatus("Processing segments...");
          } else {
            setGenerationStatus("Compiling final video...");
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (isGenerating) {
        setError("Video generation timed out");
        setIsGenerating(false);
      }
    }, 600000);
  };

  if (!showVideoTutor || !mounted) return null;

  const displayVideoUrl = generatedVideoUrl || currentVideoUrl;
  const showGenerateButton =
    lessonContent && !generatedVideoUrl && !isGenerating;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col" onClick={onClose}>
     
      <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-amber-900/30 bg-gradient-to-r from-gray-900 via-gray-900 to-amber-950/20 flex-shrink-0 relative z-10">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/50">
                <Video size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl tracking-tight">
                  AI Video Lecture
                </h3>
                <p className="text-amber-500/70 text-xs font-medium uppercase tracking-wider">
                  Powered by Neural Engine
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-amber-500/10 rounded-xl transition-all group"
            >
              <X
                size={24}
                className="text-white group-hover:text-amber-500 transition-colors"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-6xl mx-auto px-8 py-12">
            {isGeneratingVideo || isGenerating ? (
              // Generation State
              <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <div className="relative w-32 h-32 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film
                      size={40}
                      className="text-amber-500"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h4 className="text-white font-bold text-2xl">
                    Crafting Your Video Lecture
                  </h4>
                  <p className="text-amber-500/80 font-medium">
                    {generationStatus}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-2xl space-y-4">
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-amber-900/30">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-700 ease-out shadow-lg shadow-amber-500/50"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-amber-500 font-mono font-bold text-lg">
                    {Math.round(generationProgress)}%
                  </p>
                </div>

                {/* Steps */}
                <div className="w-full max-w-2xl space-y-3 pt-4">
                  {[
                    { label: "Analyzing content", threshold: 10 },
                    { label: "Generating video segments", threshold: 50 },
                    { label: "Compiling final video", threshold: 90 },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-gray-800/50 border border-amber-900/20 rounded-xl"
                    >
                      <span className="text-gray-300 font-medium">
                        {step.label}
                      </span>
                      {generationProgress > step.threshold ? (
                        <CheckCircle size={20} className="text-amber-500" />
                      ) : generationProgress > (i > 0 ? [10, 50][i - 1] : 0) ? (
                        <Loader2
                          size={20}
                          className="text-amber-500 animate-spin"
                        />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : displayVideoUrl ? (
              // Video Ready State
              <div className="space-y-6">
                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-amber-900/30">
                  <video
                    src={displayVideoUrl}
                    controls
                    autoPlay
                    className="w-full aspect-video"
                  />
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-900/30 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Film size={20} className="text-amber-500" />
                    </div>
                    <h4 className="text-white font-bold text-lg">
                      Lecture Script
                    </h4>
                  </div>
                  <div className="text-gray-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {videoScript}
                  </div>
                </div>
              </div>
            ) : (
              // Initial State
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-amber-950/20 border border-amber-900/30 rounded-3xl p-12 text-center">
                  <div className="inline-flex p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl shadow-amber-500/50 mb-6">
                    <Play size={48} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-white font-bold text-2xl mb-3">
                    Audio Lecture Mode
                  </h4>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Experience AI-generated audio narration or upgrade to full
                    video with visuals
                  </p>

                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={onReplayAudio}
                      className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-amber-500/50 transition-all flex items-center gap-3 group"
                    >
                      <Play
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Replay Audio
                    </button>

                    {showGenerateButton && (
                      <button
                        onClick={handleGenerateVideo}
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-amber-500/50 text-white rounded-xl font-bold hover:bg-amber-500/20 hover:border-amber-500 transition-all flex items-center gap-3 group"
                      >
                        <Sparkles
                          size={20}
                          className="text-amber-500 group-hover:scale-110 transition-transform"
                        />
                        Generate Video
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-900/30 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Film size={20} className="text-amber-500" />
                    </div>
                    <h4 className="text-white font-bold text-lg">
                      Lecture Content
                    </h4>
                  </div>
                  <div className="text-gray-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {videoScript}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default VideoTutorModal;
