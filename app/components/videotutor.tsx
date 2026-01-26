import React from "react";

interface VideoTutorModalProps {
  showVideoTutor: boolean;
  isGeneratingVideo: boolean;
  currentVideoUrl: string;
  videoScript: string;
  onClose: () => void;
  onReplayAudio: () => void;
}

const VideoTutorModal: React.FC<VideoTutorModalProps> = ({
  showVideoTutor,
  isGeneratingVideo,
  currentVideoUrl,
  videoScript,
  onClose,
  onReplayAudio,
}) => {
  if (!showVideoTutor) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/95 z-10 flex flex-col">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          Gemini 3 Video Lecture
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-amber-500 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isGeneratingVideo ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <svg
                className="absolute inset-0 m-auto text-amber-500"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 0 1 1h2a4 4 0 0 1 4 4v2a1 1 0 0 0 1 1 4 4 0 0 1 0 8 1 1 0 0 0-1 1v2a4 4 0 0 1-4 4h-2a1 1 0 0 0-1 1 4 4 0 0 1-8 0 1 1 0 0 0-1-1H5a4 4 0 0 1-4-4v-2a1 1 0 0 0-1-1 4 4 0 0 1 0-8 1 1 0 0 0 1-1V8a4 4 0 0 1 4-4h2a1 1 0 0 0 1-1 4 4 0 0 1 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-bold mb-2">
                Gemini 3 Generating Your Lecture
              </p>
              <p className="text-slate-400 text-sm">
                Deep reasoning in progress...
              </p>
            </div>
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Analyzing content</span>
                <span>✓</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Generating comprehensive script</span>
                <span className="animate-pulse">⋯</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Creating video presentation</span>
                <span>-</span>
              </div>
            </div>
          </div>
        ) : currentVideoUrl ? (
          <div className="space-y-4">
            <div className="bg-black rounded-xl overflow-hidden aspect-video">
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-2">
                Gemini 3 Lecture Script
              </h4>
              <div className="text-slate-300 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                {videoScript}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-6 text-center">
              <svg
                className="mx-auto text-amber-500 mb-4"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <p className="text-white font-semibold mb-2">
                Audio Lecture Mode
              </p>
              <p className="text-slate-400 text-sm mb-4">
                Playing Gemini 3 generated lecture...
              </p>
              <button
                onClick={onReplayAudio}
                className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
              >
                🔊 Replay Audio
              </button>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-2">Lecture Content</h4>
              <div className="text-slate-300 text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
                {videoScript}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTutorModal;
