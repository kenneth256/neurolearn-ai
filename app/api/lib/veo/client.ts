interface VeoGenerationParams {
      prompt: string;
  duration?: number; // Max 5 seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  style?: string;
  seed?: number;
}

interface VeoGenerationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  estimatedTime?: number;
  error?: string;
}

export class VeoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VEO_API_KEY || '';
    this.baseUrl = process.env.VEO_API_URL || '';

    if (!this.apiKey || !this.baseUrl) {
      throw new Error('Veo API credentials not configured');
    }
  }

  async generateVideo(params: VeoGenerationParams): Promise<VeoGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        duration: Math.min(params.duration || 5, 5), // Cap at 5 seconds
        aspect_ratio: params.aspectRatio || '16:9',
        style: params.style,
        seed: params.seed,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Veo API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async checkStatus(jobId: string): Promise<VeoGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check job status: ${response.statusText}`);
    }

    return response.json();
  }

  async pollUntilComplete(
    jobId: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<VeoGenerationResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkStatus(jobId);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Video generation failed');
      }

      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Video generation timed out');
  }
}