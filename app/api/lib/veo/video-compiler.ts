// lib/video-generation/video-compiler.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface CompilationSegment {
  videoUrl: string;
  transition?: string;
  duration: number;
}

interface ExecResult {
  stdout: string;
  stderr: string;
}

export class VideoCompiler {
  private tempDir: string;

  constructor(tempDir: string = '/tmp/video-compilation') {
    this.tempDir = tempDir;
  }

  async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async downloadVideo(url: string, filename: string): Promise<string> {
    const filePath = path.join(this.tempDir, filename);
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async compileVideos(segments: CompilationSegment[]): Promise<string> {
    await this.ensureTempDir();

    console.log(`📦 Compiling ${segments.length} video segments...`);

    // Download all segments
    const downloadedPaths: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const filePath = await this.downloadVideo(
        segments[i].videoUrl,
        `segment_${i}.mp4`
      );
      downloadedPaths.push(filePath);
    }

    // Create concat file for FFmpeg
    const concatFilePath = path.join(this.tempDir, 'concat_list.txt');
    const concatContent = downloadedPaths
      .map(p => `file '${p}'`)
      .join('\n');
    
    await fs.writeFile(concatFilePath, concatContent);

    // Output path
    const outputPath = path.join(this.tempDir, `compiled_${Date.now()}.mp4`);

    // Build FFmpeg command
    let ffmpegCommand: string;

    if (segments.length === 1) {
      // Single video, just copy
      ffmpegCommand = `ffmpeg -i "${downloadedPaths[0]}" -c copy "${outputPath}"`;
    } else {
      // Multiple videos with concat
      ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${outputPath}"`;
    }

    console.log('🎬 Running FFmpeg:', ffmpegCommand);

    try {
      const result: ExecResult = await execAsync(ffmpegCommand);
      console.log('✅ Video compilation complete');
      return outputPath;
    } catch (error) {
      console.error('❌ FFmpeg compilation failed:', error);
      throw new Error('Video compilation failed');
    }
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(path.join(this.tempDir, file));
      }
      console.log('🧹 Cleaned up temporary files');
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }
}