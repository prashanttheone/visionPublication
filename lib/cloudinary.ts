
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} as const;

/**
 * Validate Cloudinary configuration is complete
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
};

/**
 * Image upload configuration
 */
export const IMAGE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
  folder: 'visionpub', // Cloudinary folder path
  resourceType: 'auto',
  tags: ['visionpub'],
} as const;

/**
 * CldUploadWidget configuration
 * Used with next-cloudinary CldUploadWidget component
 */
export const getCldUploadWidgetConfig = (folder: string = IMAGE_UPLOAD_CONFIG.folder) => {
  return {
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
    folder,
    resourceType: 'auto',
    maxFiles: 1,
    maxFileSize: IMAGE_UPLOAD_CONFIG.maxSize,
    clientAllowedFormats: IMAGE_UPLOAD_CONFIG.allowedFormats,
    showAdvancedOptions: false,
    cropping: true,
    croppingAspectRatio: 16 / 9,
    croppingShowDimensions: true,
    tags: IMAGE_UPLOAD_CONFIG.tags,
  } as const;
};

/**
 * Default CldImage transformation config
 * Applies auto-optimization: WebP format, auto quality, auto crop
 */
export const getCldImageConfig = () => {
  return {
    // Auto transformations applied via CldImage props
    format: 'auto', // Serve WebP to supported browsers, fallback to original
    quality: 'auto', // Cloudinary auto-optimizes quality
    crop: 'auto', // Auto crop to focus on important areas
    gravity: 'auto', // Auto detect subject position
    fetchFormat: 'auto', // Deliver optimal format
    dpr: 'auto', // Auto device pixel ratio
  } as const;
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > IMAGE_UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${IMAGE_UPLOAD_CONFIG.maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !IMAGE_UPLOAD_CONFIG.allowedFormats.includes(fileExtension as any)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${IMAGE_UPLOAD_CONFIG.allowedFormats.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Extract public_id from Cloudinary secure_url if needed
 * Note: Only store secure_url in database, use it directly with CldImage
 */
export const extractPublicIdFromUrl = (secureUrl: string): string | null => {
  // Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
  const match = secureUrl.match(/\/v\d+\/(.+?)(?:\.|$)/);
  return match ? match[1] : null;
};
