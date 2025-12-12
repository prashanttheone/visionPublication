
import { useState, useCallback } from 'react';
import { getCldUploadWidgetConfig } from '@/lib/cloudinary';

export interface CloudinaryUploadResponse {
  event?: string;
  info?: {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    [key: string]: any;
  };
}

export interface UseCloudinaryUploadOptions {
  folder?: string;
  onSuccess?: (secureUrl: string, publicId: string) => void;
  onError?: (error: string) => void;
  onUploadStart?: () => void;
}

/**
 * Hook for managing Cloudinary uploads with CldUploadWidget
 * Returns methods to trigger widget and manage upload state
 */
export const useCloudinaryUpload = (options: UseCloudinaryUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{
    secureUrl: string;
    publicId: string;
    metadata?: any;
  } | null>(null);

  /**
   * Handle successful upload from CldUploadWidget
   */
  const handleUploadSuccess = useCallback(
    (result: CloudinaryUploadResponse) => {
      if (result.info?.secure_url && result.info?.public_id) {
        const { secure_url, public_id, ...metadata } = result.info;

        // Only store secure_url in database (Cloudinary best practice)
        setUploadedImage({
          secureUrl: secure_url,
          publicId: public_id,
          metadata,
        });

        setError(null);
        setIsUploading(false);

        options.onSuccess?.(secure_url, public_id);
      }
    },
    [options]
  );

  /**
   * Handle upload error from CldUploadWidget
   */
  const handleUploadError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      options.onError?.(errorMessage);
    },
    [options]
  );

  /**
   * Handle upload start
   */
  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
    setError(null);
    options.onUploadStart?.();
  }, [options]);

  /**
   * Clear uploaded image
   */
  const clearUpload = useCallback(() => {
    setUploadedImage(null);
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
    setUploadedImage(null);
  }, []);

  // Get widget configuration
  const widgetConfig = getCldUploadWidgetConfig(options.folder);

  return {
    // State
    isUploading,
    error,
    uploadedImage,

    // Event handlers for CldUploadWidget
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
    onStart: handleUploadStart,

    // Methods
    clearUpload,
    reset,

    // Configuration
    widgetConfig,
  };
};
