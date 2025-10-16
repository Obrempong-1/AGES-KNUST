import { useState } from 'react';
import { toast } from 'sonner';

// Define the shape of the options for the hook
interface UseImageUploadOptions {
  path: 'executives' | 'gallery' | 'content' | 'news' | 'events' | 'personalities' | 'blogs' | 'announcements';
}

// Define the return shape of the hook
interface UseImageUploadReturn {
  uploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (publicUrl: string) => Promise<void>;
}

const API_URL = 'https://us-central1-piwc-asokwa-site.cloudfunctions.net/api';

export const useImageUpload = (options: UseImageUploadOptions): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      // 1. Get the signed URL from the backend
      const response = await fetch(`${API_URL}/generate-upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          path: options.path,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get pre-signed URL');
      }

      const { uploadUrl, publicUrl } = await response.json();

      // 2. Upload the file to the signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload to Google Cloud Storage failed.');
      }

      // 3. Return the public URL
      return publicUrl;
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred during upload.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicUrl: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/delete-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicUrl }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete image');
        }
        toast.success("Image deleted successfully");
    } catch (error: any) {
        toast.error(error.message || 'An unexpected error occurred during deletion.');
    }
  };


  return { uploading, uploadImage, deleteImage };
};
