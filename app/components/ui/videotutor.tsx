import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const useVideoLecture = (
  lessonContext: string,
  moduleName: string,
  fileContent?: string,
) => {
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoScript, setVideoScript] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const generateLecture = async (topic?: string) => {
    setIsGeneratingVideo(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not found");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: {
          //@ts-ignore
          thinkingConfig: {
            thinkingLevel: "high",
            includeThoughts: false,
          },
        },
      });

      const prompt = `Create a detailed, engaging video lecture script for: ${topic || lessonContext}

Module: ${moduleName}
${fileContent ? `Code Example:\n${fileContent}\n\n` : ""}

Generate a comprehensive 3-5 minute lecture script with:

1. HOOK (10 seconds): Start with an intriguing question or statement
2. INTRODUCTION (20 seconds): Explain what we'll learn and why it matters
3. MAIN CONTENT (2-3 minutes): Break down into 3-4 digestible sections:
   - Explain core concepts clearly
   - Use analogies and real-world examples
   - Show practical applications
   ${fileContent ? "- Walk through the code step-by-step\n" : ""}
4. VISUAL CUES: Include [VISUAL: description] markers for what should appear on screen
5. RECAP (20 seconds): Summarize key takeaways
6. CALL TO ACTION (10 seconds): Encourage practice and next steps

Make it conversational, engaging, and educational. Use simple language.
Format as a natural speaking script that flows well when read aloud.`;

      const result = await model.generateContent(prompt);
      const script = result.response.text();
      setVideoScript(script);

      // Try to generate video using D-ID API
      try {
        const didResponse = await fetch("https://api.d-id.com/talks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(process.env.NEXT_PUBLIC_DID_API_KEY || "")}`,
          },
          body: JSON.stringify({
            script: {
              type: "text",
              input: script,
              provider: {
                type: "microsoft",
                voice_id: "en-US-JennyNeural",
              },
            },
            source_url:
              "https://create-images-results.d-id.com/default-presenter-image.jpg",
            config: {
              stitch: true,
            },
          }),
        });

        if (!didResponse.ok) throw new Error("D-ID API failed");

        const videoData = await didResponse.json();
        const videoId = videoData.id;

        // Poll for video completion
        const pollForVideo = async () => {
          const statusResponse = await fetch(
            `https://api.d-id.com/talks/${videoId}`,
            {
              headers: {
                Authorization: `Basic ${btoa(process.env.NEXT_PUBLIC_DID_API_KEY || "")}`,
              },
            },
          );
          const status = await statusResponse.json();

          if (status.status === "done") {
            setCurrentVideoUrl(status.result_url);
            setIsGeneratingVideo(false);
          } else if (status.status === "error") {
            throw new Error("Video generation failed");
          } else {
            setTimeout(pollForVideo, 3000);
          }
        };

        pollForVideo();
      } catch (videoError) {
        console.log("Video generation unavailable, using audio mode");
        setIsGeneratingVideo(false);
        // Play audio
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Lecture generation error:", error);
      setIsGeneratingVideo(false);
    }
  };

  const replayAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(videoScript);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return {
    isGeneratingVideo,
    videoScript,
    currentVideoUrl,
    generateLecture,
    replayAudio,
  };
};
