
import { useState } from 'react';
import { toast } from 'sonner';

interface UseFileUploadOptions {
  path: 'executives' | 'gallery' | 'content' | 'news' | 'events' | 'personalities' | 'blogs' | 'announcements';
}

interface UseFileUploadReturn {
  uploading: boolean;
  uploadFile: (file: File) => Promise<string | null>;
  deleteFile: (publicUrl: string) => Promise<void>;
}

const API_URL = 'https://us-central1-piwc-asokwa-site.cloudfunctions.net/api';

export const useImageUpload = (options: UseFileUploadOptions): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
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

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload to Google Cloud Storage failed.');
      }

      return publicUrl;
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred during upload.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (publicUrl: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/delete-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicUrl }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete file');
        }
        toast.success("File deleted successfully");
    } catch (error: any) {
        toast.error(error.message || 'An unexpected error occurred during deletion.');
    }
  };


  return { uploading, uploadFile, deleteFile };
};
