'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Badge,
  Spinner,
  Button,
  Stack,
  Separator
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BlogPost } from '@/types/blog';

const MotionBox = motion.create(Box);

interface BlogDisplayProps {
  slug: string;
  isDraft?: boolean;
}

/**
 * Blog Display/Render Component
 * Displays a single blog post with full HTML content
 */
export default function BlogDisplay({ slug, isDraft = false }: BlogDisplayProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const url = isDraft 
          ? `/api/blog/draft/${slug}`
          : `/api/blog/${slug}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Blog post not found');
        }

        const data = await response.json();
        setPost(data.post);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load blog post';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, isDraft]);

  if (isLoading) {
    return (
      <Container maxW="900px" py={20}>
        <Stack gap={4} justifyContent="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading blog post...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxW="900px" py={20}>
        <Stack gap={4} justifyContent="center" minH="400px">
          <Heading size="lg" color="red.500">404</Heading>
          <Text color="gray.600">{error || 'Blog post not found'}</Text>
          <Button colorScheme="blue" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="900px" py={12}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Stack gap={6} alignItems="stretch" mb={12}>
          {/* Title */}
          <Stack gap={2} alignItems="stretch">
            <Heading
              as="h1"
              size="2xl"
              lineHeight="1.2"
              color="gray.900"
            >
              {post.title}
            </Heading>
            
            {post.subtitle && (
              <Text fontSize="lg" color="gray.600" fontWeight="500">
                {post.subtitle}
              </Text>
            )}
          </Stack>

          {/* Metadata Bar */}
          <HStack
            gap={6}
            pb={6}
            borderBottomWidth={1}
            borderColor="gray.200"
            flexWrap="wrap"
            width="full"
          >
            {/* Category Badge */}
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              {post.category || 'General'}
            </Badge>

            {/* Author Info */}
            <Stack gap={0} alignItems="start">
              <Text fontWeight="600" fontSize="sm">
                {post.author}
              </Text>
              {post.authorRole && (
                <Text fontSize="xs" color="gray.600">
                  {post.authorRole}
                </Text>
              )}
            </Stack>

            {/* Divider */}
            <Separator orientation="vertical" height="40px" />

            {/* Date */}
            <Text fontSize="sm" color="gray.600">
              📅 {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>

            {/* Read Time */}
            <Text fontSize="sm" color="gray.600">
              ⏱️ {post.readTime} min read
            </Text>

            {/* View Count */}
            {post.viewCount !== undefined && (
              <Text fontSize="sm" color="gray.600">
                👁️ {post.viewCount} views
              </Text>
            )}
          </HStack>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <HStack gap={2} flexWrap="wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="subtle" colorScheme="gray">
                  #{tag}
                </Badge>
              ))}
            </HStack>
          )}
        </Stack>

        {/* Featured Image */}
        {post.image && (
          <Box mb={12} borderRadius="lg" overflow="hidden">
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src={post.image}
                alt={post.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </MotionBox>
          </Box>
        )}

        {/* Excerpt */}
        <Box
          p={6}
          bg="blue.50"
          borderLeftWidth={4}
          borderLeftColor="blue.400"
          borderRadius="md"
          mb={12}
        >
          <Text fontSize="lg" color="gray.800" lineHeight="1.8">
            {post.excerpt}
          </Text>
        </Box>

        {/* Blog Content - HTML Rendering */}
        <Box
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          css={{
            // Typography
            '& p': {
              marginBottom: '1.5rem',
              lineHeight: '1.8',
              fontSize: '16px',
              color: '#2d3748'
            },

            // Headings
            '& h1': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '2rem',
              fontWeight: '800',
              color: '#1a202c',
              lineHeight: '1.2'
            },
            '& h2': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#2d3748',
              borderBottomWidth: '2px',
              borderBottomColor: '#e2e8f0',
              paddingBottomWidth: '0.5rem'
            },
            '& h3': {
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2d3748'
            },
            '& h4, & h5, & h6': {
              marginTop: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#4a5568'
            },

            // Lists
            '& ul': {
              marginLeft: '2rem',
              marginBottom: '1.5rem',
              paddingLeft: '0'
            },
            '& ol': {
              marginLeft: '2rem',
              marginBottom: '1.5rem',
              paddingLeft: '0'
            },
            '& li': {
              marginBottom: '0.75rem',
              lineHeight: '1.8',
              color: '#2d3748'
            },

            // Code
            '& code': {
              backgroundColor: '#f7fafc',
              color: '#c53030',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '0.9em'
            },
            '& pre': {
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '8px',
              overflow: 'auto',
              marginBottom: '1.5rem',
              fontSize: '0.9em',
              lineHeight: '1.6'
            },
            '& pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              borderRadius: '0'
            },

            // Blockquotes
            '& blockquote': {
              borderLeftWidth: '4px',
              borderLeftColor: '#4299e1',
              paddingLeft: '1.5rem',
              marginLeft: '0',
              marginBottom: '1.5rem',
              color: '#4a5568',
              fontStyle: 'italic',
              backgroundColor: '#edf2f7',
              padding: '1rem 1rem 1rem 1.5rem',
              borderRadius: '4px'
            },

            // Links
            '& a': {
              color: '#3182ce',
              textDecoration: 'underline',
              fontWeight: '500',
              transition: 'color 0.2s',
              '&:hover': {
                color: '#2563eb'
              }
            },

            // Images
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              marginTop: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            },

            // Videos (embedded)
            '& iframe': {
              maxWidth: '100%',
              height: 'auto',
              marginBottom: '1.5rem',
              borderRadius: '8px'
            },

            // Tables
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1.5rem',
              borderWidth: '1px',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            },
            '& th': {
              backgroundColor: '#edf2f7',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#2d3748',
              borderBottomWidth: '2px',
              borderBottomColor: '#cbd5e0'
            },
            '& td': {
              padding: '1rem',
              borderBottomWidth: '1px',
              borderBottomColor: '#e2e8f0',
              color: '#4a5568'
            },
            '& tr:hover': {
              backgroundColor: '#f7fafc'
            },

            // Strong and emphasis
            '& strong': {
              fontWeight: '700',
              color: '#1a202c'
            },
            '& em': {
              fontStyle: 'italic',
              color: '#4a5568'
            },

            // General spacing
            '& > *': {
              margin: '0 0 1.5rem 0'
            },
            '& > *:last-child': {
              marginBottom: '0'
            }
          }}
        />

        {/* Footer Section */}
        <Stack
          gap={6}
          mt={12}
          pt={8}
          borderTopWidth={2}
          borderTopColor="gray.200"
          alignItems="stretch"
        >
          {/* Like & Share */}
          <HStack gap={4}>
            <Button variant="outline" colorScheme="gray">
              👍 Like ({post.likeCount || 0})
            </Button>
            <Button variant="outline" colorScheme="gray">
              💬 Comment
            </Button>
            <Button variant="outline" colorScheme="gray">
              📤 Share
            </Button>
          </HStack>

          {/* Author Bio */}
          <Box p={6} bg="gray.50" borderRadius="lg">
            <HStack alignItems="start" gap={4}>
              <Box
                w="60px"
                h="60px"
                borderRadius="full"
                bg="blue.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="2xl"
                flexShrink={0}
              >
                ✍️
              </Box>
              <Stack gap={1} alignItems="start">
                <Heading size="sm">{post.author}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {post.authorRole || 'Healthcare Professional'}
                </Text>
                <Text fontSize="sm" color="gray.700" mt={2}>
                  Passionate about healthcare education and innovation.
                </Text>
              </Stack>
            </HStack>
          </Box>
        </Stack>
      </MotionBox>
    </Container>
  );
}
