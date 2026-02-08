import { GoogleGenerativeAI } from "@google/generative-ai";

interface VideoGenerationOptions {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: number;
  numberOfVideos?: number;
}

interface VideoGenerationResult {
  success: boolean;
  videos?: Array<{
    url: string;
    seed: number;
  }>;
  error?: string;
}

export class GeminiVideoGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    try {
      const {
        prompt,
        aspectRatio = "16:9",
        duration = 5,
        numberOfVideos = 1,
      } = options;

      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ["image/video"],
          aspectRatio,
          duration,
          numberOfVideos,
        },
      });

      const videos = [];
      for (const candidate of result.response.candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith("video/")) {
            const videoData = part.inlineData.data;
            const blob = this.base64ToBlob(videoData, part.inlineData.mimeType);
            const url = URL.createObjectURL(blob);
            
            videos.push({
              url,
              seed: candidate.seed || Math.random(),
            });
          }
        }
      }

      return {
        success: true,
        videos,
      };
    } catch (error) {
      console.error("Video generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate video",
      };
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async generateVideoFromImage(
    prompt: string,
    imageData: string,
    imageMimeType: string = "image/jpeg"
  ): Promise<VideoGenerationResult> {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageData,
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["image/video"],
        },
      });

      const videos = [];
      for (const candidate of result.response.candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith("video/")) {
            const videoData = part.inlineData.data;
            const blob = this.base64ToBlob(videoData, part.inlineData.mimeType);
            const url = URL.createObjectURL(blob);
            
            videos.push({
              url,
              seed: candidate.seed || Math.random(),
            });
          }
        }
      }

      return {
        success: true,
        videos,
      };
    } catch (error) {
      console.error("Video generation from image error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate video from image",
      };
    }
  }
}