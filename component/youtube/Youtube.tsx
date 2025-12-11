'use client';

import { Box, Container, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiPlayCircle } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface YouTubeVideo {
  id: number;
  title: string;
  headline: string;
  videoId: string;
  thumbnail: string;
  duration: string;
}

export default function Youtube() {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const videos: YouTubeVideo[] = [
    {
      id: 1,
      title: 'Healthcare Education Excellence',
      headline: 'Transforming Nursing Education with Modern Methods',
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '12:45',
    },
    {
      id: 2,
      title: 'Clinical Best Practices',
      headline: 'Evidence-Based Approaches to Patient Care',
      videoId: 'jNQXAC9IVRw',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      duration: '18:30',
    },
    {
      id: 3,
      title: 'Medical Research Insights',
      headline: 'Latest Discoveries in Healthcare Innovation',
      videoId: '9bZkp7q19f0',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      duration: '15:20',
    },
    {
      id: 4,
      title: 'Professional Development',
      headline: 'Career Growth Strategies for Healthcare Professionals',
      videoId: 'OPf0YbXqDm0',
      thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
      duration: '22:15',
    },
  ];

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
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(100, 181, 246, 0.25)',
      transition: { duration: 0.3 },
    },
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedVideo(null);
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1200px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        {/* Header Section */}
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center" mb={{ base: '60px', md: '80px' }}>
          <MotionBox variants={itemVariants} mb="20px">
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                Video Library
              </Text>
            </Box>
          </MotionBox>

          <MotionBox variants={itemVariants} mb="20px">
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" color="white">
              Educational
            </Text>
            <Text fontSize={{ base: '42px', md: '56px', lg: '64px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              Video Content
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Explore our collection of expert-led videos covering healthcare education, clinical practices, research insights, and professional development.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Videos Grid */}
        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={{ base: '24px', md: '28px' }}>
          {videos.map((video) => (
            <MotionBox key={video.id} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius="16px"
                overflow="hidden"
                backdropFilter="blur(10px)"
                height="100%"
                display="flex"
                flexDirection="column"
                transition="all 0.3s ease"
                _hover={{
                  borderColor: 'rgba(100, 181, 246, 0.4)',
                }}
              >
                {/* Video Thumbnail */}
                <Box
                  position="relative"
                  width="100%"
                  height="180px"
                  overflow="hidden"
                  bg="rgba(100, 181, 246, 0.1)"
                  backgroundImage={`url(${video.thumbnail})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  cursor="pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Play Button Overlay */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(0, 0, 0, 0.3)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _groupHover={{ bg: 'rgba(0, 0, 0, 0.5)' }}
                    transition="all 0.3s ease"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <HiPlayCircle size={56} color="white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                    </motion.div>
                  </Box>

                  {/* Duration Badge */}
                  <Badge
                    position="absolute"
                    bottom="12px"
                    right="12px"
                    bg="rgba(0, 0, 0, 0.7)"
                    color="white"
                    px="10px"
                    py="4px"
                    borderRadius="4px"
                    fontSize="xs"
                    fontWeight="700"
                  >
                    {video.duration}
                  </Badge>
                </Box>

                {/* Card Footer */}
                <Box p={{ base: '16px', md: '20px' }} flex="1" display="flex" flexDirection="column">
                  <Text fontSize="sm" color="gray.400" fontWeight="600" mb="8px">
                    Video {video.id}
                  </Text>

                  <Text fontSize={{ base: '15px', md: '16px' }} fontWeight="800" color="white" lineHeight="1.4" mb="8px">
                    {video.title}
                  </Text>

                  <Text fontSize="sm" color="gray.300" lineHeight="1.5" flex="1">
                    {video.headline}
                  </Text>

                  {/* Watch Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVideoClick(video)}
                    style={{
                      marginTop: '16px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '700',
                      border: '1px solid rgba(100, 181, 246, 0.5)',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))',
                      color: '#64B5F6',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Watch Now
                  </motion.button>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </Box>
      </Container>

      {/* Video Player Modal */}
      {isOpen && selectedVideo && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          backdropFilter="blur(4px)"
          p={{ base: '20px', md: '40px' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(100, 181, 246, 0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 140, 0, 0.2)',
                border: '1px solid rgba(255, 140, 0, 0.5)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10,
              }}
            >
              ✕
            </motion.button>

            {/* Video Player */}
            <iframe
              width="100%"
              height="500px"
              src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block', borderRadius: '16px 16px 0 0' }}
            />

            {/* Video Info */}
            <Box p={{ base: '20px', md: '28px' }}>
              <Text fontSize="xs" color="gray.400" fontWeight="600" mb="8px">
                Video {selectedVideo.id} • {selectedVideo.duration}
              </Text>

              <Text fontSize={{ base: '18px', md: '22px' }} fontWeight="900" color="white" mb="12px">
                {selectedVideo.title}
              </Text>

              <Text fontSize="14px" color="gray.300" lineHeight="1.6">
                {selectedVideo.headline}
              </Text>

              {/* Action Buttons */}
              <Box display="flex" gap="12px" mt="20px">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    border: '1px solid rgba(100, 181, 246, 0.3)',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#64B5F6',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Close
                </motion.button>
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}
