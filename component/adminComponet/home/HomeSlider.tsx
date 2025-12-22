"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Input,
  Textarea,
  Button,
  Text,
  HStack,
  Badge,
  Heading,
} from '@chakra-ui/react';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

interface HomeSlider {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  display_order: string;
  is_active: boolean;
}

export default function HomeSlider() {
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    display_order: '0',
    is_active: true,
  });

  // Fetch sliders on mount
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/home/slider');
      const data = await response.json();

      if (data.success) {
        setSliders(data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch sliders');
      }
    } catch (err) {
      console.error('Error fetching sliders:', err);
      setError('Error loading sliders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      display_order: '0',
      is_active: true,
    });
    setUploadedImageUrl('');
    setEditingId(null);
  };

  const handleEditClick = (slider: HomeSlider) => {
    setFormData({
      title: slider.title,
      description: slider.description,
      image_url: slider.image_url,
      link_url: slider.link_url || '',
      display_order: String(slider.display_order),
      is_active: slider.is_active,
    });
    setUploadedImageUrl(slider.image_url);
    setEditingId(slider.id);
    window.scrollTo(0, 0);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = useCallback(async () => {
    const finalImageUrl = uploadedImageUrl || formData.image_url;

    if (!formData.title || !finalImageUrl) {
      alert('❌ Please fill in all required fields (Title, Image)');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        image_url: finalImageUrl,
        link_url: formData.link_url || null,
        display_order: formData.display_order ? parseInt(formData.display_order, 10) : 0,
        is_active: formData.is_active,
      };

      if (editingId) {
        // Update existing slider
        const response = await fetch('/api/home/slider', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        });

        const result = await response.json();
        if (result.success) {
          setSliders((prev) =>
            prev.map((s) => (s.id === editingId ? result.data : s))
          );
          alert('✅ Slider updated successfully');
          resetForm();
        } else {
          alert(`❌ ${result.error}`);
        }
      } else {
        // Create new slider
        const response = await fetch('/api/home/slider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          setSliders((prev) => [...prev, result.data]);
          alert('✅ Slider created successfully');
          resetForm();
        } else {
          alert(`❌ ${result.error}`);
        }
      }
    } catch (err) {
      console.error('Error saving slider:', err);
      alert('❌ Error saving slider');
    }
  }, [editingId, formData, uploadedImageUrl]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this slider?')) {
      return;
    }

    try {
      const response = await fetch(`/api/home/slider?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setSliders((prev) => prev.filter((s) => s.id !== id));
        alert('✅ Slider deleted successfully');
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      console.error('Error deleting slider:', err);
      alert('❌ Error deleting slider');
    }
  }, []);

  return (
    <Container maxW="1400px" py="40px">
      {/* Form Section */}
      <Box mb="60px" bg="rgba(30, 41, 59, 0.6)" borderRadius="16px" border="1px solid rgba(100, 181, 246, 0.2)" p="24px">
        <Heading as="h2" size="md" color="white" mb="24px">
          {editingId ? '✏️ Edit Slider' : '➕ Create New Slider'}
        </Heading>

        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="16px" mb="16px">
          {/* Title */}
          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="600" mb="4px">Title *</Text>
            <Input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g., Quality Education"
              bg="rgba(15, 23, 42, 0.8)"
              border="1px solid rgba(100, 181, 246, 0.2)"
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
          </Box>

          {/* Link URL */}
          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="600" mb="4px">Link URL (Optional)</Text>
            <Input
              name="link_url"
              value={formData.link_url}
              onChange={handleFormChange}
              placeholder="e.g., /books or https://example.com"
              bg="rgba(15, 23, 42, 0.8)"
              border="1px solid rgba(100, 181, 246, 0.2)"
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Box mb="16px">
          <Text color="gray.300" fontSize="sm" fontWeight="600" mb="4px">Description</Text>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Add detailed description..."
            bg="rgba(15, 23, 42, 0.8)"
            border="1px solid rgba(100, 181, 246, 0.2)"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            minH="80px"
          />
        </Box>

        {/* Image Upload */}
        <Box mb="16px">
          <Text color="gray.300" fontSize="sm" fontWeight="600" mb="4px">Banner Image * (Cloudinary)</Text>
          <CloudinaryImageUpload
            onImageSelect={(url) => {
              setUploadedImageUrl(url);
              setFormData((prev) => ({ ...prev, image_url: url }));
            }}
          />
        </Box>

        {/* Display Order */}
        <Box mb="16px">
          <Text color="gray.300" fontSize="sm" fontWeight="600" mb="4px">Display Order</Text>
          <Input
            name="display_order"
            type="number"
            value={formData.display_order}
            onChange={handleFormChange}
            placeholder="0"
            bg="rgba(15, 23, 42, 0.8)"
            border="1px solid rgba(100, 181, 246, 0.2)"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
        </Box>

        {/* Active Status */}
        <Box display="flex" alignItems="center" gap="8px" mb="24px">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleFormChange}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#64B5F6',
            }}
          />
          <Text color="gray.300" fontSize="sm">Active (Display on homepage)</Text>
        </Box>

        {/* Form Actions */}
        <HStack gap="12px">
          <Button colorScheme="blue" onClick={handleSave}>
            {editingId ? 'Update Slider' : 'Create Slider'}
          </Button>
          {editingId && (
            <Button colorScheme="gray" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </HStack>
      </Box>

      {/* Sliders List Section */}
      <Box>
        <Heading as="h1" size="lg" color="black" mb="24px">
          🎆 Home Sliders Management
        </Heading>

        {error && (
          <Box bg="red.500" color="white" p="12px" borderRadius="8px" mb="20px">
            {error}
          </Box>
        )}

        {isLoading ? (
          <Text color="white">Loading sliders...</Text>
        ) : sliders.length > 0 ? (
          <Box overflowX="auto" bg="rgba(30, 41, 59, 0.6)" borderRadius="16px" border="1px solid rgba(100, 181, 246, 0.2)">
            <Box as="table" width="100%" borderCollapse="collapse">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid rgba(100, 181, 246, 0.2)">
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">ID</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Title</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Description</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Image</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Link</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Status</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Order</Box>
                  <Box as="th" color="gray.300" fontSize="sm" p="12px" textAlign="left" fontWeight="600">Actions</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {sliders.map((slider) => (
                  <Box as="tr" key={slider.id} borderBottom="1px solid rgba(100, 181, 246, 0.1)" _hover={{ bg: 'rgba(100, 181, 246, 0.05)' }}>
                    <Box as="td" color="white" fontSize="sm" p="12px">{slider.id}</Box>
                    <Box as="td" color="gray.200" fontSize="sm" p="12px" maxW="150px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {slider.title}
                    </Box>
                    <Box as="td" color="gray.300" fontSize="sm" p="12px" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {slider.description || '-'}
                    </Box>
                    <Box as="td" fontSize="sm" p="12px">
                      {slider.image_url ? (
                        <img
                          src={slider.image_url}
                          alt={slider.title}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <Text color="gray.400">No image</Text>
                      )}
                    </Box>
                    <Box as="td" color="blue.300" fontSize="xs" p="12px" maxW="120px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {slider.link_url || '-'}
                    </Box>
                    <Box as="td" fontSize="sm" p="12px">
                      <Badge colorScheme={slider.is_active ? 'green' : 'gray'}>
                        {slider.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Box>
                    <Box as="td" color="white" fontSize="sm" p="12px" textAlign="center">
                      {slider.display_order}
                    </Box>
                    <Box as="td" p="12px">
                      <HStack gap="8px">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditClick(slider)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(slider.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Text color="gray.300">No sliders found. Create one to get started!</Text>
        )}
      </Box>
    </Container>
  );
}
