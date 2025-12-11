'use client';

import { Box, Container, Text, Badge, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { HiArrowLeft, HiClock, HiUser } from 'react-icons/hi2';
import { blogPosts } from '@/component/blog/blogData';

const MotionBox = motion.create(Box);

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="600px" textAlign="center">
          <Text fontSize="48px" fontWeight="900" color="white" mb="16px">
            404
          </Text>
          <Text fontSize="24px" color="gray.300" mb="32px">
            Blog post not found
          </Text>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Go Back
          </motion.button>
        </Container>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const relatedPosts = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      {/* Back Button */}
      <Box py="24px" position="relative" zIndex={1}>
        <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'rgba(100, 181, 246, 0.1)',
              border: '1px solid rgba(100, 181, 246, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
          >
            <HiArrowLeft size={16} />
            Back to Blogs
          </motion.button>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box py={{ base: '40px', md: '60px' }} position="relative" zIndex={1}>
        <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={containerVariants} initial="hidden" animate="visible">
            {/* Category Badge */}
            <MotionBox variants={itemVariants} mb="20px">
              <Badge bg="linear-gradient(135deg, #FF8C00, #FFA500)" color="white" px="14px" py="8px" borderRadius="8px" fontSize="sm" fontWeight="700" display="inline-block">
                {post.category}
              </Badge>
            </MotionBox>

            {/* Title */}
            <MotionBox variants={itemVariants} mb="20px">
              <Text fontSize={{ base: '36px', md: '48px', lg: '56px' }} fontWeight="900" lineHeight="1.2" color="white">
                {post.title}
              </Text>
            </MotionBox>

            {/* Subtitle */}
            <MotionBox variants={itemVariants} mb="30px">
              <Text fontSize={{ base: '18px', md: '20px' }} color="gray.300" lineHeight="1.6">
                {post.subtitle}
              </Text>
            </MotionBox>

            {/* Meta Info */}
            <MotionBox variants={itemVariants} display="flex" gap={{ base: '20px', md: '40px' }} flexWrap="wrap" pb="30px" borderBottom="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
            <Box display="flex" gap="8px" color="gray.400" fontSize="sm" alignItems="flex-start">
                <HiUser size={16} />
                <Box>
                  <Text fontWeight="600" color="white">
                    {post.author}
                  </Text>
                  <Text fontSize="xs">{post.authorRole}</Text>
                </Box>
              </Box>

              <Box display="flex" gap="8px" color="gray.400" fontSize="sm">
                <Text>{formatDate(post.date)}</Text>
              </Box>

              <Box display="flex" gap="8px" color="gray.400" fontSize="sm" alignItems="center">
                <HiClock size={16} />
                <Text>{post.readTime} min read</Text>
              </Box>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* Featured Image */}
      <MotionBox
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        my={{ base: '40px', md: '60px' }}
        position="relative"
        zIndex={1}
      >
        <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
          <Box
            width="100%"
            height={{ base: '300px', md: '500px' }}
            borderRadius="16px"
            overflow="hidden"
            border="1px solid"
            borderColor="rgba(100, 181, 246, 0.2)"
            backgroundImage={`url(${post.image})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />
        </Container>
      </MotionBox>

      {/* Content */}
      <Box py={{ base: '40px', md: '60px' }} position="relative" zIndex={1}>
        <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Box
              fontSize={{ base: '16px', md: '18px' }}
              color="gray.300"
              lineHeight="1.9"
            >
              {/* Content Styling */}
              <style>{`
                .blog-content h2 {
                  font-size: 28px;
                  font-weight: 800;
                  color: white;
                  margin-top: 40px;
                  margin-bottom: 20px;
                }
                .blog-content h3 {
                  font-size: 22px;
                  font-weight: 700;
                  color: white;
                  margin-top: 32px;
                  margin-bottom: 16px;
                }
                .blog-content p {
                  margin-bottom: 20px;
                }
                .blog-content strong {
                  color: white;
                  font-weight: 700;
                }
                .blog-content em {
                  color: #64B5F6;
                }
                .blog-content ul,
                .blog-content ol {
                  margin-left: 20px;
                  margin-bottom: 20px;
                }
                .blog-content li {
                  margin-bottom: 8px;
                }
              `}</style>
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .split('\n\n')
                    .map((paragraph) => {
                      if (paragraph.startsWith('## ')) {
                        return `<h2>${paragraph.replace('## ', '')}</h2>`;
                      } else if (paragraph.startsWith('### ')) {
                        return `<h3>${paragraph.replace('### ', '')}</h3>`;
                      } else if (paragraph.startsWith('**') && paragraph.includes(':')) {
                        return `<p><strong>${paragraph.replace(/\*\*/g, '')}</strong></p>`;
                      }
                      return `<p>${paragraph}</p>`;
                    })
                    .join(''),
                }}
              />
            </Box>
          </MotionBox>

          {/* Tags */}
          {post.tags.length > 0 && (
            <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mt="60px" pt="40px" borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
              <Text fontSize="sm" fontWeight="700" color="gray.400" mb="16px" textTransform="uppercase" letterSpacing="1px">
                Tags
              </Text>
              <Box display="flex" gap="8px" flexWrap="wrap">
                {post.tags.map((tag) => (
                  <Badge key={tag} bg="rgba(100, 181, 246, 0.1)" color="#64B5F6" px="12px" py="6px" borderRadius="6px" fontSize="sm" fontWeight="600">
                    {tag}
                  </Badge>
                ))}
              </Box>
            </MotionBox>
          )}
        </Container>
      </Box>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
          <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
            <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb="40px">
              <Text fontSize={{ base: '28px', md: '36px' }} fontWeight="900" color="white">
                Related Articles
              </Text>
            </MotionBox>

            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="24px">
              {relatedPosts.map((relatedPost) => (
                <MotionBox
                  key={relatedPost.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                  cursor="pointer"
                  whileHover={{ y: -8 }}
                >
                  <Box
                    bg="rgba(30, 41, 59, 0.6)"
                    border="1px solid"
                    borderColor="rgba(100, 181, 246, 0.2)"
                    borderRadius="12px"
                    overflow="hidden"
                    backdropFilter="blur(10px)"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: 'rgba(100, 181, 246, 0.4)',
                    }}
                  >
                    <Box width="100%" height="160px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)" backgroundImage={`url(${relatedPost.image})`} backgroundSize="cover" backgroundPosition="center" />

                    <Box p="16px">
                      <Text fontSize="sm" color="gray.400" mb="8px">
                        {relatedPost.title}
                      </Text>
                      <Badge bg="rgba(255, 140, 0, 0.2)" color="#FF8C00" fontSize="xs" fontWeight="600">
                        {relatedPost.category}
                      </Badge>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Newsletter CTA */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1}>
        <Container maxW="900px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} textAlign="center">
            <Box
              bg="linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))"
              border="1px solid"
              borderColor="rgba(100, 181, 246, 0.2)"
              borderRadius="16px"
              p={{ base: '40px', md: '60px' }}
              backdropFilter="blur(10px)"
            >
              <Text fontSize={{ base: '24px', md: '32px' }} fontWeight="900" color="white" mb="16px">
                Stay Updated
              </Text>
              <Text fontSize="md" color="gray.300" mb="32px">
                Subscribe to our newsletter for the latest healthcare insights and publishing updates.
              </Text>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)',
                }}
              >
                Subscribe Now
              </motion.button>
            </Box>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
}
