'use client';

import { useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { CldImage } from 'next-cloudinary';
import { Box, Button, Text } from '@chakra-ui/react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { getCldImageConfig, isCloudinaryConfigured } from '@/lib/cloudinary';


export default function CloudinaryImageUpload({ onImageSelect }: { onImageSelect?: (secureUrl: string) => void }) {
  const {
    isUploading,
    error,
    uploadedImage,
    onSuccess,
    onError,
    onStart,
    widgetConfig,
    clearUpload,
  } = useCloudinaryUpload({
    folder: 'visionpub/uploads',
    onSuccess: (secureUrl) => {
      // Store only secure_url in database
      onImageSelect?.(secureUrl);
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });

  if (!isCloudinaryConfigured()) {
    return (
      <Box p={6} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
        <Text color="red.700" fontWeight="bold">
          ⚠️ Cloudinary is not configured
        </Text>
        <Text color="red.600" fontSize="sm" mt={2}>
          Please set environment variables:
        </Text>
        <Box ml={4} mt={2} fontSize="sm" color="red.600">
          <div>• NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</div>
          <div>• NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</div>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* CldUploadWidget */}
      <CldUploadWidget
        uploadPreset={widgetConfig.uploadPreset}
        onSuccess={(result: any) => onSuccess(result)}
        onError={onError}
        options={widgetConfig as any}
      >
        {({ open }) => (
          <Button
            colorScheme="blue"
            onClick={() => open?.()}
            disabled={isUploading}
            width="full"
            mb={4}
          >
            {isUploading ? '⏳ Uploading...' : '📤 Upload Image'}
          </Button>
        )}
      </CldUploadWidget>

      {/* Error Message */}
      {error && (
        <Box p={3} mb={4} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
          <Text color="red.700" fontSize="sm">
            ❌ {error}
          </Text>
        </Box>
      )}

      {/* Uploaded Image Display */}
      {uploadedImage && (
        <Box>
          <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
            <Text fontWeight="bold" mb={3} fontSize="sm">
              ✅ Image Uploaded Successfully
            </Text>

            {/* CldImage with auto transformations */}
            {/* Auto applies: WebP format, auto quality, auto crop, auto gravity, dpr */}
            <Box mb={4}>
              <CldImage
                src={uploadedImage.secureUrl}
                alt="Uploaded image"
                width={400}
                height={300}
                {...getCldImageConfig()}
                style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto' }}
              />
            </Box>

            {/* Image Information */}
            <Box>
              <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
                Secure URL (Store this in database):
              </Text>
              <Box
                bg="white"
                p={2}
                borderRadius="sm"
                fontSize="xs"
                fontFamily="mono"
                wordBreak="break-all"
                maxH="100px"
                overflowY="auto"
                mb={3}
              >
                {uploadedImage.secureUrl}
              </Box>

              {uploadedImage.metadata && (
                <Box>
                  <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
                    Metadata:
                  </Text>
                  <Box fontSize="xs" color="gray.600">
                    {uploadedImage.metadata.width && (
                      <div>Size: {uploadedImage.metadata.width}x{uploadedImage.metadata.height}px</div>
                    )}
                    {uploadedImage.metadata.bytes && (
                      <div>File Size: {(uploadedImage.metadata.bytes / 1024).toFixed(2)} KB</div>
                    )}
                    {uploadedImage.metadata.format && <div>Format: {uploadedImage.metadata.format}</div>}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Button colorScheme="red" variant="outline" size="sm" onClick={clearUpload} width="full">
            🗑️ Clear
          </Button>
        </Box>
      )}

      {/* Info Box */}
      <Box p={4} mt={4} bg="blue.50" borderRadius="md" fontSize="sm" color="blue.800" borderLeft="4px" borderColor="blue.400">
        <Text fontWeight="bold" mb={2}>
          💡 Implementation Details:
        </Text>
        <Box fontSize="xs">
          <div>✓ Uses CldUploadWidget for uploads</div>
          <div>✓ Only secure_url stored in database</div>
          <div>✓ CldImage auto-applies WebP, quality, crop, gravity</div>
          <div>✓ Responsive images with auto device pixel ratio</div>
        </Box>
      </Box>
    </Box>
  );
}
