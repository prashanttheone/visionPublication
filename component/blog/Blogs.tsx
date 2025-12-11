'use client';

import { Box, Container, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HiClock, HiTag } from 'react-icons/hi2';
import { blogPosts } from './blogData';

const MotionBox = motion.create(Box);

export default function Blogs() {
  const router = useRouter();

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -12,
      boxShadow: '0 24px 48px rgba(100, 181, 246, 0.25)',
      transition: { duration: 0.3 },
    },
  };

  const handleReadMore = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1200px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        {/* Header Section */}
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center" mb={{ base: '60px', md: '80px' }}>
          {/* Badge */}
          <MotionBox variants={itemVariants} mb="20px">
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                Our Blog
              </Text>
            </Box>
          </MotionBox>

          {/* Heading */}
          <MotionBox variants={itemVariants} mb="20px">
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" color="white" mb="20px">
              Healthcare Insights &
            </Text>
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              Expert Articles
            </Text>
          </MotionBox>

          {/* Description */}
          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Stay informed with the latest trends, research, and insights in healthcare education and medical publishing.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Blog Grid */}
        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '24px', md: '32px' }}>
          {blogPosts.map((post) => (
            <MotionBox key={post.id} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={cardVariants} whileHover="hover" onClick={() => handleReadMore(post.slug)} style={{ cursor: 'pointer', height: '100%' }}>
                <Box
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  borderRadius="16px"
                  overflow="hidden"
                  backdropFilter="blur(10px)"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: 'rgba(100, 181, 246, 0.4)',
                  }}
                  display="flex"
                  flexDirection="column"
                  height="100%"
                >
                  {/* Image Container */}
                  <Box position="relative" width="100%" height="220px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                    <Box
                      backgroundImage={`url(${post.image})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                      width="100%"
                      height="100%"
                      transition="transform 0.3s ease"
                      _groupHover={{
                        transform: 'scale(1.05)',
                      }}
                    />

                    {/* Category Badge */}
                    <Box position="absolute" top="16px" left="16px">
                      <Badge bg="linear-gradient(135deg, #FF8C00, #FFA500)" color="white" px="12px" py="6px" borderRadius="8px" fontSize="xs" fontWeight="700">
                        {post.category}
                      </Badge>
                    </Box>

                    {/* Read Time Badge */}
                    <Box position="absolute" top="16px" right="16px" display="flex" alignItems="center" gap="6px" bg="rgba(0, 0, 0, 0.5)" px="12px" py="6px" borderRadius="8px" backdropFilter="blur(10px)">
                      <HiClock size={14} color="white" />
                      <Text fontSize="xs" fontWeight="600" color="white">
                        {post.readTime} min
                      </Text>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box p={{ base: '20px', md: '24px' }} flex="1" display="flex" flexDirection="column">
                    {/* Date */}
                    <Text fontSize="xs" color="gray.400" fontWeight="600" mb="12px">
                      {formatDate(post.date)}
                    </Text>

                    {/* Title */}
                    <Text fontSize={{ base: '18px', md: '20px' }} fontWeight="800" color="white" mb="12px" lineHeight="1.4">
                      {post.title.length > 60 ? `${post.title.substring(0, 60)}...` : post.title}
                    </Text>

                    {/* Subtitle */}
                    <Text fontSize="sm" color="gray.400" mb="16px" lineHeight="1.5">
                      {post.subtitle.length > 80 ? `${post.subtitle.substring(0, 80)}...` : post.subtitle}
                    </Text>

                    {/* Excerpt */}
                    <Text fontSize="sm" color="gray.300" mb="16px" lineHeight="1.6" flex="1">
                      {post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
                    </Text>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <Box display="flex" gap="8px" mb="16px" flexWrap="wrap">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Box key={tag} fontSize="xs" color="gray.400" display="flex" gap="4px" alignItems="center">
                            <HiTag size={12} />
                            <Text>{tag}</Text>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Divider */}
                    <Box height="1px" bg="linear-gradient(to-r, transparent, rgba(100, 181, 246, 0.2), transparent)" my="16px" />

                    {/* Author Info */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="white">
                          {post.author}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {post.authorRole}
                        </Text>
                      </Box>

                      {/* Read More Button */}
                      <Box
                        bg="linear-gradient(135deg, #64B5F6, #42A5F5)"
                        width="36px"
                        height="36px"
                        borderRadius="8px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        fontSize="18px"
                        transition="all 0.3s ease"
                        _hover={{
                          transform: 'translateX(4px)',
                        }}
                      >
                        →
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </MotionBox>
          ))}
        </Box>

        {/* CTA Section */}
        <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} textAlign="center" mt={{ base: '60px', md: '80px' }}>
          <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" mb="24px">
            Stay updated with our latest insights and articles
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
            Subscribe to Newsletter
          </motion.button>
        </MotionBox>
      </Container>
    </Box>
  );
}
