import { useState, useCallback, useRef } from "react";

interface UseVideoGeneratorOptions {
  autoExtractContent?: boolean;
  contentSelector?: string;
}

export function useVideoGenerator(options: UseVideoGeneratorOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState<Array<{ url: string; seed: number }>>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const extractContent = useCallback(
    (selector?: string) => {
      
      if (typeof document === "undefined") return "";

      const targetSelector = selector || options.contentSelector || "main";

     
      const element = document.querySelector(
        targetSelector,
      ) as HTMLElement | null;

      if (element) {
        return element.innerText.slice(0, 3000);
      }

      return document.body.innerText.slice(0, 3000);
    },
    [options.contentSelector],
  );

  const generatePrompt = useCallback(
    async (customContext?: any) => {
      setGeneratingPrompt(true);
      setError(null);

      try {
        const pageContent =
          options.autoExtractContent !== false ? extractContent() : "";

        const response = await fetch("/api/ai/videoprop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { pageContent, ...customContext },
          }),
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const contentType = response.headers.get("content-type");
        let generatedPrompt = "";

        if (contentType?.includes("application/json")) {
          const result = await response.json();
          generatedPrompt = result.prompt;
        } else {
          generatedPrompt = await response.text();
        }

        setPrompt(generatedPrompt);
        return generatedPrompt;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Prompt generation failed";
        setError(msg);
        throw err;
      } finally {
        setGeneratingPrompt(false);
      }
    },
    [extractContent, options.autoExtractContent],
  );

  const generateVideo = useCallback(
    async (videoPrompt: string, config?: any) => {
      setLoading(true);
      setError(null);
      setVideos([]);

      try {
        const response = await fetch("/api/ai/videoprop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: videoPrompt,
            aspectRatio: config?.aspectRatio || "16:9",
            duration: config?.duration || 5,
          }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        if (data.videos) {
          setVideos(data.videos);
          setLoading(false);
          return data.videos;
        }

        if (data.operationName) {
          return pollVideoStatus(data.operationName);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Video synthesis failed");
        setLoading(false);
      }
    },
    [],
  );

  const pollVideoStatus = async (operationName: string) => {
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/ai/videoprop/status?name=${operationName}`,
        );
        const status = await res.json();

        if (status.done && status.videoUrl) {
          const finalVideo = [{ url: status.videoUrl, seed: Math.random() }];
          setVideos(finalVideo);
          setLoading(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          return finalVideo;
        }

        if (status.error) throw new Error(status.error);
      } catch (err) {
        setError("Polling failed");
        setLoading(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    };

    pollIntervalRef.current = setInterval(poll, 5000);
  };

  const generateFromContent = useCallback(
    async (ctx?: any, cfg?: any) => {
      const p = await generatePrompt(ctx);
      return await generateVideo(p, cfg);
    },
    [generatePrompt, generateVideo],
  );

  return {
    prompt,
    setPrompt,
    videos,
    loading,
    generatingPrompt,
    error,
    generatePrompt,
    generateVideo,
    generateFromContent,
  };
}
