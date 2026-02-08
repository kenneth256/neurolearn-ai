"use client";

import { useState, useRef, useCallback } from "react";

export type DetectedMood =
  | "ENGAGED"
  | "NEUTRAL"
  | "BORED"
  | "FRUSTRATED"
  | "CONFUSED"
  | "EXCITED"
  | "OVERWHELMED";

interface MoodDetectionResult {
  mood: DetectedMood;
  intensity: number;
  confidence: number;
  trigger?: string;
}

interface MoodHistoryItem {
  mood: DetectedMood;
  intensity: number;
  timestamp: number;
}

export function useMoodDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodDetectionResult | null>(
    null,
  );
  const [moodHistory, setMoodHistory] = useState<MoodHistoryItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      return true;
    } catch (error) {
      console.error("Camera access denied:", error);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const analyzeWithGemini = useCallback(
    async (imageData: string): Promise<MoodDetectionResult> => {
      try {
        
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/mood/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageData,
            previousMood: currentMood?.mood,
            moodHistory: moodHistory.slice(-3).map((r: MoodHistoryItem) => ({
              mood: r.mood,
              intensity: Math.round(r.intensity / 20),
              timestamp: r.timestamp,
            })),
            sessionDuration:
              moodHistory.length > 0
                ? Math.round((Date.now() - moodHistory[0].timestamp) / 60000)
                : 0,
          }),
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Analysis failed: ${response.statusText}`,
          );
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Invalid response from analysis");
        }

        return result.data as MoodDetectionResult;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          throw new Error("Analysis was cancelled");
        }

        console.error("Mood analysis error:", err);
        throw err;
      }
    },
    [currentMood, moodHistory],
  );

  const detectMood = useCallback(async () => {
    setIsDetecting(true);

    try {
      const cameraStarted = await startCamera();
      if (!cameraStarted) {
        throw new Error("Camera access required");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const frame = captureFrame();
      if (!frame) {
        throw new Error("Failed to capture frame");
      }

      const moodResult = await analyzeWithGemini(frame);
      setCurrentMood(moodResult);

     
      setMoodHistory((prev) => [
        ...prev,
        {
          mood: moodResult.mood,
          intensity: moodResult.intensity,
          timestamp: Date.now(),
        },
      ]);

      stopCamera();
      return moodResult;
    } catch (error) {
      console.error("Mood detection error:", error);
      stopCamera();
      throw error;
    } finally {
      setIsDetecting(false);
    }
  }, [startCamera, stopCamera, captureFrame, analyzeWithGemini]);

  const cancelDetection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopCamera();
    setIsDetecting(false);
  }, [stopCamera]);

  return {
    videoRef,
    isDetecting,
    currentMood,
    moodHistory,
    detectMood,
    startCamera,
    stopCamera,
    cancelDetection,
  };
}
