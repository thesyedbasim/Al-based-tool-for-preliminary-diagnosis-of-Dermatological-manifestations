import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
  static async uploadImage(imagePath) {
    try {
      const result = await cloudinary.v2.uploader.upload(imagePath, {
        folder: 'skin-diagnosis',
        resource_type: 'image'
      });
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed');
    }
  }

  static async generateVideoFromImages(images) {
    // This would generate a video from multiple image angles
    // For now, we'll return a placeholder
    return {
      video_url: "https://example.com/placeholder-video.mp4",
      message: "Video generation feature coming soon"
    };
  }
}