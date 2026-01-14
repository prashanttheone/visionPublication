'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Input,
  Textarea,
  Button,
  Stack,
  Heading,
  Text,
  Badge,
  Separator
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Import the custom Quill wrapper
import QuillEditor from './QuillEditor';
import { authUtils } from '@/lib/auth';
import { CreateBlogPostRequest } from '@/types/blog';
import { BLOG_CATEGORIES, calculateReadTime, generateSlug, createExcerpt } from '@/types/blog';

const MotionBox = motion.create(Box);

// Wrapper component for Chakra v3 compatibility
const FormControl = ({ children, isRequired, ...props }: any) => (
  <Box {...props}>
    {children}
  </Box>
);
const FormLabel = (props: any) => <Box as="label" fontWeight="bold" mb={2} {...props} />;


/**
 * Blog Post Editor Component
 */
export default function BlogPostEditor() {
  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: BLOG_CATEGORIES[0],
    tags: [],
    imageUrl: '',
    authorName: 'Dr. Author',
    authorRole: 'Healthcare Specialist',
    isPublished: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'settings'>('edit');

  /**
   * Calculate metadata from content
   */
  const metadata = useMemo(() => {
    return {
      readTime: calculateReadTime(formData.content),
      wordCount: formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length,
      characterCount: formData.content.replace(/<[^>]*>/g, '').length
    };
  }, [formData.content]);

  /**
   * Handle content change from Quill editor
   */
  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

  /**
   * Handle input field changes
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  /**
   * Handle tag input
   */
  const handleTagsChange = (selectedTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: selectedTags }));
  };

  /**
   * Auto-generate excerpt from content
   */
  const handleAutoGenerateExcerpt = useCallback(() => {
    const excerpt = createExcerpt(formData.content, 160);
    setFormData(prev => ({ ...prev, excerpt }));
    alert('Excerpt auto-generated from content');
  }, [formData.content]);

  /**
   * Auto-generate slug from title
   */
  const handleAutoGenerateSlug = useCallback(() => {
    if (!formData.title) {
      alert('Please enter a title first');
      return;
    }
    const slug = generateSlug(formData.title);
    alert(`Slug Generated: ${slug}`);
  }, [formData.title]);

  /**
   * Validate form before submission
   */
  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return false;
    }

    if (!formData.content.trim()) {
      alert('Content cannot be empty');
      return false;
    }

    if (!formData.excerpt.trim()) {
      alert('Excerpt is required');
      return false;
    }

    return true;
  }, [formData]);

  /**
   * Save as draft
   */
  const handleSaveDraft = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authUtils.fetchWithAuth('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save draft');
      }

      const data = await response.json();
      alert(`Draft Saved: ${data.post.slug}`);

      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        category: BLOG_CATEGORIES[0],
        tags: [],
        imageUrl: '',
        authorName: 'Dr. Author',
        authorRole: 'Healthcare Specialist',
        isPublished: false
      });

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  /**
   * Publish blog post
   */
  const handlePublish = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authUtils.fetchWithAuth('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }

      const data = await response.json();
      alert(`Published Successfully: ${data.post.slug}`);

      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        category: BLOG_CATEGORIES[0],
        tags: [],
        imageUrl: '',
        authorName: 'Dr. Author',
        authorRole: 'Healthcare Specialist',
        isPublished: false
      });

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  return (
    <Container maxW="1200px" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Stack gap={6} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Create Blog Post
            </Heading>
            <Text color="gray.600">
              Write and publish engaging healthcare content
            </Text>
          </Box>

          {/* Metadata Display */}
          <Stack direction="row" gap={6} bg="blue.50" p={4} borderRadius="md" w="full">
            <Box>
              <Text fontSize="sm" color="gray.600">Reading Time</Text>
              <Heading size="sm">{metadata.readTime} min</Heading>
            </Box>
            <Separator orientation="vertical" height="40px" />
            <Box>
              <Text fontSize="sm" color="gray.600">Words</Text>
              <Heading size="sm">{metadata.wordCount}</Heading>
            </Box>
            <Separator orientation="vertical" height="40px" />
            <Box>
              <Text fontSize="sm" color="gray.600">Characters</Text>
              <Heading size="sm">{metadata.characterCount}</Heading>
            </Box>
          </Stack>

          {/* Tab Buttons */}
          <Stack direction="row" gap={2} mb={4}>
            <Button
              onClick={() => setActiveTab('edit')}
              variant={activeTab === 'edit' ? 'solid' : 'outline'}
              colorScheme={activeTab === 'edit' ? 'blue' : 'gray'}
            >
              Edit
            </Button>
            <Button
              onClick={() => setActiveTab('preview')}
              variant={activeTab === 'preview' ? 'solid' : 'outline'}
              colorScheme={activeTab === 'preview' ? 'blue' : 'gray'}
            >
              Preview
            </Button>
            <Button
              onClick={() => setActiveTab('settings')}
              variant={activeTab === 'settings' ? 'solid' : 'outline'}
              colorScheme={activeTab === 'settings' ? 'blue' : 'gray'}
            >
              Settings
            </Button>
          </Stack>

          {/* EDIT TAB */}
          {activeTab === 'edit' && (
            <Stack gap={6} align="stretch">
              {/* Title */}
              <FormControl isRequired>
                <FormLabel>Blog Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog post title"
                  size="lg"
                  borderColor="blue.300"
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  This will be used to create the URL slug
                </Text>
              </FormControl>

              {/* Subtitle */}
              <FormControl>
                <FormLabel>Subtitle</FormLabel>
                <Input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Optional secondary title"
                  size="md"
                />
              </FormControl>

              {/* Excerpt */}
              <FormControl isRequired>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <FormLabel mb={0}>Excerpt</FormLabel>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={handleAutoGenerateExcerpt}
                    disabled={!formData.content}
                  >
                    Auto-Generate
                  </Button>
                </Stack>
                <Textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary for listings (max 160 chars)"
                  rows={3}
                  maxLength={160}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {formData.excerpt.length}/160 characters
                </Text>
              </FormControl>

              {/* Featured Image */}
              <FormControl>
                <FormLabel>Featured Image URL</FormLabel>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://images.example.com/blog.jpg"
                  type="url"
                />
              </FormControl>

              {/* Rich Text Editor */}
              <FormControl isRequired>
                <FormLabel>Blog Content</FormLabel>
                <QuillEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog post..."
                />
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Use the toolbar to format your content with bold, italic, links, images, and more
                </Text>
              </FormControl>
            </Stack>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <Stack gap={6} align="stretch">
              <Box bg="gray.50" p={8} borderRadius="lg">
                {/* Preview Header */}
                <Heading size="lg" mb={4}>
                  {formData.title || 'Blog Title'}
                </Heading>
                {formData.subtitle && (
                  <Text fontSize="lg" color="gray.600" mb={4}>
                    {formData.subtitle}
                  </Text>
                )}

                {/* Preview Metadata */}
                <Stack direction="row" gap={4} mb={6} pb={4} borderBottomWidth={1} borderColor="gray.300">
                  <Badge colorScheme="blue">{formData.category}</Badge>
                  <Text fontSize="sm" color="gray.600">
                    By {formData.authorName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {metadata.readTime} min read
                  </Text>
                </Stack>

                {/* Featured Image Preview */}
                {formData.imageUrl && (
                  <Box mb={6}>
                    <img
                      src={formData.imageUrl}
                      alt={formData.title}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                )}

                {/* Content Preview */}
                <Box
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content yet...</p>' }}
                  css={{
                    '& p': { marginBottom: '1rem', lineHeight: '1.6' },
                    '& h1, & h2, & h3': { marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' },
                    '& h1': { fontSize: '2rem' },
                    '& h2': { fontSize: '1.5rem' },
                    '& h3': { fontSize: '1.25rem' },
                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '1rem' },
                    '& code': { backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' },
                    '& pre': { backgroundColor: '#f5f5f5', padding: '1rem', overflow: 'auto', borderRadius: '4px', marginBottom: '1rem' },
                    '& ul, & ol': { marginLeft: '2rem', marginBottom: '1rem' },
                    '& li': { marginBottom: '0.5rem' },
                    '& blockquote': { borderLeftWidth: '4px', borderLeftColor: '#3182ce', paddingLeft: '1rem', marginLeft: 0, color: '#666' },
                    '& a': { color: '#3182ce', textDecoration: 'underline' }
                  }}
                />
              </Box>
            </Stack>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <Stack gap={6} align="stretch">
              {/* Category */}
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e0',
                    fontSize: '16px'
                  }}
                >
                  {BLOG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </FormControl>

              {/* Tags */}
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Stack align="start" gap={2}>
                  {['nursing', 'healthcare', 'education', 'research', 'technology', 'clinical', 'innovation', 'student'].map(tag => (
                    <Box key={tag} display="flex" alignItems="center" gap={2}>
                      <input
                        type="checkbox"
                        id={tag}
                        value={tag}
                        checked={((formData.tags as string[]) || []).includes(tag)}
                        onChange={(e) => {
                          const tags = (formData.tags as string[]) || [];
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, tags: [...tags, tag] }));
                          } else {
                            setFormData(prev => ({ ...prev, tags: tags.filter(t => t !== tag) }));
                          }
                        }}
                      />
                      <label htmlFor={tag} style={{ margin: 0, cursor: 'pointer' }}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </label>
                    </Box>
                  ))}
                </Stack>
              </FormControl>

              {/* Author Information */}
              <FormControl isRequired>
                <FormLabel>Author Name</FormLabel>
                <Input
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleInputChange}
                  placeholder="Dr. Author"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Author Role</FormLabel>
                <Input
                  name="authorRole"
                  value={formData.authorRole}
                  onChange={handleInputChange}
                  placeholder="Healthcare Specialist"
                />
              </FormControl>

              {/* Publication Status */}
              <Box p={4} bg="yellow.50" borderRadius="md" borderLeftWidth={4} borderLeftColor="yellow.400">
                <Text fontSize="sm" fontWeight="bold">
                  ⚠️ Publishing Information
                </Text>
                <Text fontSize="sm" color="gray.700" mt={2}>
                  Click "Save as Draft" to save without publishing, or "Publish" to make it live immediately.
                </Text>
              </Box>
            </Stack>
          )}

          {/* Action Buttons */}
          <Stack direction="row" gap={4} justifyContent="flex-end" pt={6} borderTopWidth={1} borderColor="gray.200">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              📝 Save as Draft
            </Button>
            <Button
              colorScheme="green"
              onClick={handlePublish}
              disabled={isLoading}
            >
              🚀 Publish Post
            </Button>
          </Stack>
        </Stack>
      </MotionBox>
    </Container>
  );
}
