import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  url: string;
  thumbnailUrl: string;
  duration: number;
}

export class CloudinaryUploader {
  async uploadVideo(
    filePath: string,
    folder: string = 'course-videos'
  ): Promise<CloudinaryUploadResult> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        folder,
        format: 'mp4',
        eager: [
          { width: 1280, height: 720, crop: 'limit', format: 'mp4' },
        ],
        eager_async: true,
      });

      return {
        url: result.secure_url,
        thumbnailUrl: result.secure_url.replace(/\.[^.]+$/, '.jpg'),
        duration: result.duration || 0,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw new Error('Failed to upload video to cloud storage');
    }
  }

  async uploadFromUrl(
    url: string,
    folder: string = 'course-videos'
  ): Promise<CloudinaryUploadResult> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(url, {
        resource_type: 'video',
        folder,
        format: 'mp4',
      });

      return {
        url: result.secure_url,
        thumbnailUrl: result.secure_url.replace(/\.[^.]+$/, '.jpg'),
        duration: result.duration || 0,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw new Error('Failed to upload video to cloud storage');
    }
  }
}