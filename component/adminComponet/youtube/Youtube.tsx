'use client';

import { Box, Container, Text, Button } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { HiTrash, HiPencil } from 'react-icons/hi2';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

interface YouTubeVideo {
  id: number;
  title: string;
  headline: string;
  video_id: string;
  thumbnail: string;
  duration: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  headline: string;
  video_id: string;
  thumbnail: string;
  duration: string;
  is_active: boolean;
}

export default function YoutubeAdmin() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    headline: '',
    video_id: '',
    thumbnail: '',
    duration: '',
    is_active: true,
  });

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/youtube');
      const data = await response.json();

      if (data.success) {
        setVideos(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const resetForm = () => {
    setFormData({
      title: '',
      headline: '',
      video_id: '',
      thumbnail: '',
      duration: '',
      is_active: true,
    });
    setUploadedImageUrl('');
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageSelect = (secureUrl: string) => {
    setUploadedImageUrl(secureUrl);
    setFormData(prev => ({ ...prev, thumbnail: secureUrl }));
  };

  const handleSave = async () => {
    try {
      // Use uploaded image if available, otherwise use the thumbnail field
      const thumbnail = uploadedImageUrl || formData.thumbnail;

      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (!formData.headline.trim()) {
        setError('Headline is required');
        return;
      }

      if (!formData.video_id.trim()) {
        setError('YouTube Video ID is required');
        return;
      }

      if (!thumbnail.trim()) {
        setError('Thumbnail image is required');
        return;
      }

      if (!formData.duration.trim()) {
        setError('Duration is required');
        return;
      }

      setError(null);

      const payload = {
        title: formData.title.trim(),
        headline: formData.headline.trim(),
        video_id: formData.video_id.trim(),
        thumbnail,
        duration: formData.duration.trim(),
        is_active: formData.is_active,
      };

      if (editingId) {
        // Update
        const response = await fetch(`/api/youtube/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
          setError(null);
          await fetchVideos();
          resetForm();
        } else {
          setError(data.error || 'Failed to update video');
        }
      } else {
        // Create
        const response = await fetch('/api/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
          setError(null);
          await fetchVideos();
          resetForm();
        } else {
          setError(data.error || 'Failed to create video');
        }
      }
    } catch (err) {
      console.error('Error saving video:', err);
      setError('Failed to save video');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/youtube/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        await fetchVideos();
      } else {
        setError(data.error || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  const handleEditClick = (video: YouTubeVideo) => {
    setFormData({
      title: video.title,
      headline: video.headline,
      video_id: video.video_id,
      thumbnail: video.thumbnail,
      duration: video.duration,
      is_active: video.is_active,
    });
    setUploadedImageUrl(video.thumbnail);
    setEditingId(video.id);
    window.scrollTo(0, 0);
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
      <Container maxW="1200px" px={{ base: '16px', md: '32px' }}>
        <Text fontSize={{ base: '28px', md: '36px' }} fontWeight="900" color="white" mb="40px">
          YouTube Videos Management
        </Text>

        {/* Error Message */}
        {error && (
          <Box bg="red.900" color="red.100" p="16px" borderRadius="8px" mb="24px">
            <Text>{error}</Text>
          </Box>
        )}

        {/* Form Section */}
        <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid rgba(100, 181, 246, 0.2)" borderRadius="16px" p={{ base: '20px', md: '32px' }} mb="40px" backdropFilter="blur(10px)">
          <Text fontSize="20px" fontWeight="700" color="white" mb="24px">
            {editingId ? 'Edit Video' : 'Add New Video'}
          </Text>

          {/* Title & Headline */}
          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="16px" mb="16px">
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                Title *
              </Text>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Video title"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                Headline *
              </Text>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="Video headline/description"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </Box>
          </Box>

          {/* YouTube Video ID & Duration */}
          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="16px" mb="16px">
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                YouTube Video ID *
              </Text>
              <input
                type="text"
                name="video_id"
                value={formData.video_id}
                onChange={handleInputChange}
                placeholder="e.g., JyvX1LkNXz8"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                Duration *
              </Text>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 12:45"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </Box>
          </Box>

          {/* Image Upload */}
          <Box mb="16px">
            <Text fontSize="sm" fontWeight="600" color="gray.300" mb="12px">
              Thumbnail Image * {uploadedImageUrl && '✓'}
            </Text>
            <CloudinaryImageUpload onImageSelect={handleImageSelect} />
            {uploadedImageUrl && (
              <Box mt="12px">
                <img
                  src={uploadedImageUrl}
                  alt="Thumbnail preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '8px',
                    border: '1px solid rgba(100, 181, 246, 0.2)',
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Active Toggle */}
          <Box mb="24px" display="flex" alignItems="center" gap="12px">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
            />
            <Text fontSize="sm" fontWeight="600" color="gray.300">
              Active (Visible on homepage)
            </Text>
          </Box>

          {/* Form Buttons */}
          <Box display="flex" gap="12px">
            <Button
              onClick={handleSave}
              bg="linear-gradient(135deg, #FF8C00, #FFA500)"
              color="white"
              fontWeight="700"
              px="24px"
              py="12px"
              borderRadius="8px"
              border="none"
              cursor="pointer"
              _hover={{ opacity: 0.9 }}
            >
              {editingId ? 'Update Video' : 'Create Video'}
            </Button>

            {editingId && (
              <Button
                onClick={resetForm}
                bg="transparent"
                color="white"
                fontWeight="700"
                px="24px"
                py="12px"
                borderRadius="8px"
                border="1px solid rgba(255, 255, 255, 0.2)"
                cursor="pointer"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                Cancel Edit
              </Button>
            )}
          </Box>
        </Box>

        {/* Videos Table */}
        <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid rgba(100, 181, 246, 0.2)" borderRadius="16px" overflow="hidden" backdropFilter="blur(10px)">
          {isLoading ? (
            <Box p="40px" textAlign="center">
              <Text color="white">Loading videos...</Text>
            </Box>
          ) : videos.length === 0 ? (
            <Box p="40px" textAlign="center">
              <Text color="gray.300">No videos found. Create your first video!</Text>
            </Box>
          ) : (
            <Box as="table" width="100%">
              <Box as="thead" bg="rgba(100, 181, 246, 0.1)" borderBottom="1px solid rgba(100, 181, 246, 0.2)">
                <Box as="tr" display="grid" gridTemplateColumns="50px 1fr 150px 150px 120px 80px" gap="12px" p="16px">
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="left">
                    ID
                  </Text>
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="left">
                    Title
                  </Text>
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="left">
                    Video ID
                  </Text>
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="left">
                    Duration
                  </Text>
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="center">
                    Status
                  </Text>
                  <Text as="th" fontSize="sm" fontWeight="700" color="gray.300" textAlign="center">
                    Actions
                  </Text>
                </Box>
              </Box>

              <Box as="tbody">
                {videos.map((video) => (
                  <Box
                    key={video.id}
                    as="tr"
                    display="grid"
                    gridTemplateColumns="50px 1fr 150px 150px 120px 80px"
                    gap="12px"
                    p="16px"
                    borderBottom="1px solid rgba(100, 181, 246, 0.1)"
                    alignItems="center"
                    _hover={{ bg: 'rgba(100, 181, 246, 0.05)' }}
                  >
                    <Text fontSize="sm" color="gray.300">
                      {video.id}
                    </Text>
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="white" mb="4px">
                        {video.title}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {video.headline}
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="gray.300">
                      {video.video_id}
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      {video.duration}
                    </Text>
                    <Box display="flex" justifyContent="center">
                      <Box
                        bg={video.is_active ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}
                        color={video.is_active ? '#4CAF50' : '#F44336'}
                        px="12px"
                        py="4px"
                        borderRadius="4px"
                        fontSize="xs"
                        fontWeight="600"
                      >
                        {video.is_active ? 'Active' : 'Inactive'}
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="center" gap="8px">
                      <Button
                        onClick={() => handleEditClick(video)}
                        bg="transparent"
                        color="#64B5F6"
                        p="8px"
                        borderRadius="4px"
                        border="1px solid rgba(100, 181, 246, 0.3)"
                        cursor="pointer"
                        _hover={{ bg: 'rgba(100, 181, 246, 0.1)' }}
                      >
                        <HiPencil size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(video.id)}
                        bg="transparent"
                        color="#F44336"
                        p="8px"
                        borderRadius="4px"
                        border="1px solid rgba(244, 67, 54, 0.3)"
                        cursor="pointer"
                        _hover={{ bg: 'rgba(244, 67, 54, 0.1)' }}
                      >
                        <HiTrash size={16} />
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
