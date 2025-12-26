'use client';

import { Box, Container, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiArrowLeft, HiPlayCircle } from 'react-icons/hi2';
import { useRouter, useParams } from 'next/navigation';

const MotionBox = motion.create(Box);

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  category: string;
  videos: Video[];
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.id as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    // Dummy playlist data
    const dummyPlaylists: Record<string, Playlist> = {
      '1': {
        id: 1,
        title: 'Obstetrics and Midwifery Nursing',
        description: 'Comprehensive guide to obstetrics and midwifery nursing practices covering prenatal care, labor management, and postpartum care.',
        category: 'Clinical Nursing',
        videos: [
          {
            id: 1,
            title: 'Introduction to Obstetric Nursing',
            description: 'Overview of obstetric nursing fundamentals and patient care principles',
            thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
            duration: '12:45',
            videoId: 'dQw4w9WgXcQ',
          },
          {
            id: 2,
            title: 'Prenatal Care and Assessment',
            description: 'Complete guide to prenatal assessments and monitoring techniques',
            thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
            duration: '18:30',
            videoId: 'dQw4w9WgXcQ',
          },
          {
            id: 3,
            title: 'Labor and Delivery Management',
            description: 'Best practices for managing labor stages and delivery procedures',
            thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
            duration: '25:15',
            videoId: 'dQw4w9WgXcQ',
          },
          {
            id: 4,
            title: 'Postpartum Care Essentials',
            description: 'Essential postpartum care and recovery monitoring',
            thumbnail: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
            duration: '15:20',
            videoId: 'dQw4w9WgXcQ',
          },
          {
            id: 5,
            title: 'High-Risk Pregnancy Management',
            description: 'Managing high-risk pregnancies and complications',
            thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
            duration: '22:10',
            videoId: 'dQw4w9WgXcQ',
          },
        ],
      },
      '2': {
        id: 2,
        title: 'Psychology in Healthcare',
        description: 'Understanding patient psychology and mental health in medical settings, therapeutic communication, and psychological assessment.',
        category: 'Mental Health',
        videos: [
          {
            id: 1,
            title: 'Introduction to Healthcare Psychology',
            description: 'Basic concepts of psychology in medical environments',
            thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
            duration: '14:25',
            videoId: 'f1qz8vn3XbY',
          },
          {
            id: 2,
            title: 'Patient Communication Techniques',
            description: 'Effective communication strategies for patient care',
            thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
            duration: '16:40',
            videoId: 'dQw4w9WgXcQ',
          },
          {
            id: 3,
            title: 'Mental Health Assessment',
            description: 'Tools and methods for mental health evaluation',
            thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
            duration: '20:15',
            videoId: 'f1qz8vn3XbY',
          },
        ],
      },
    };

    const foundPlaylist = dummyPlaylists[playlistId];
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      setSelectedVideo(foundPlaylist.videos[0]);
      setAutoplay(false); // Don't autoplay the first video
    }
    setIsLoading(false);
  }, [playlistId]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setAutoplay(true); // Enable autoplay when clicking a video
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py="80px">
        <Container maxW="1400px">
          <Text color="white" fontSize="18px" fontWeight="700" textAlign="center">
            Loading playlist...
          </Text>
        </Container>
      </Box>
    );
  }

  if (!playlist) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py="80px">
        <Container maxW="1400px">
          <Text color="white" fontSize="18px" fontWeight="700" textAlign="center">
            Playlist not found
          </Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
      <Container maxW="1400px" px={{ base: '20px', md: '40px' }}>
        <MotionBox variants={containerVariants} initial="hidden" animate="visible">
          {/* Back Button */}
          <MotionBox variants={itemVariants} mb="40px">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '700',
                border: '1px solid rgba(100, 181, 246, 0.3)',
                borderRadius: '8px',
                background: 'rgba(100, 181, 246, 0.1)',
                color: '#64B5F6',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <HiArrowLeft size={20} />
              Back to Playlists
            </motion.button>
          </MotionBox>

          {/* Playlist Header */}
          <MotionBox variants={itemVariants} mb="40px">
            <Badge colorScheme="blue" fontSize="sm" mb="16px">
              {playlist.category}
            </Badge>
            <Text fontSize={{ base: '32px', md: '42px' }} fontWeight="900" color="white" mb="16px">
              {playlist.title}
            </Text>
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6" maxW="800px">
              {playlist.description}
            </Text>
          </MotionBox>

          {/* Main Content */}
          <Box display="flex" flexDirection={{ base: 'column', lg: 'row' }} gap="40px">
            {/* Video Player */}
            <MotionBox variants={itemVariants} flex="1">
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius="16px"
                overflow="hidden"
                backdropFilter="blur(10px)"
              >
                {/* Video */}
                <Box
                  position="relative"
                  width="100%"
                  paddingBottom="56.25%"
                  bg="black"
                >
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                    src={`https://www.youtube.com/embed/${selectedVideo?.videoId}${autoplay ? '?autoplay=1' : ''}`}
                    title={selectedVideo?.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>

                {/* Video Info */}
                <Box p={{ base: '20px', md: '28px' }}>
                  <Text fontSize={{ base: '20px', md: '24px' }} fontWeight="900" color="white" mb="12px">
                    {selectedVideo?.title}
                  </Text>
                  <Text fontSize="14px" color="gray.300" lineHeight="1.6">
                    {selectedVideo?.description}
                  </Text>
                </Box>
              </Box>
            </MotionBox>

            {/* Video List */}
            <MotionBox variants={itemVariants} w={{ base: '100%', lg: '400px' }}>
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius="16px"
                backdropFilter="blur(10px)"
                p={{ base: '16px', md: '20px' }}
                maxH={{ base: 'auto', lg: '700px' }}
                overflowY="auto"
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(100, 181, 246, 0.1)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(100, 181, 246, 0.3)',
                    borderRadius: '10px',
                  },
                }}
              >
                <Text fontSize="18px" fontWeight="800" color="white" mb="20px">
                  Playlist ({playlist.videos.length} videos)
                </Text>

                <Box display="flex" flexDirection="column" gap="12px">
                  {playlist.videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box
                        display="flex"
                        gap="12px"
                        p="12px"
                        bg={selectedVideo?.id === video.id ? 'rgba(100, 181, 246, 0.15)' : 'rgba(100, 181, 246, 0.05)'}
                        border="1px solid"
                        borderColor={selectedVideo?.id === video.id ? 'rgba(100, 181, 246, 0.4)' : 'rgba(100, 181, 246, 0.1)'}
                        borderRadius="12px"
                        cursor="pointer"
                        onClick={() => handleVideoClick(video)}
                        transition="all 0.3s ease"
                        _hover={{
                          bg: 'rgba(100, 181, 246, 0.1)',
                          borderColor: 'rgba(100, 181, 246, 0.3)',
                        }}
                      >
                        {/* Thumbnail */}
                        <Box position="relative" flexShrink={0}>
                          <Box
                            w="120px"
                            h="68px"
                            borderRadius="8px"
                            overflow="hidden"
                            bg="rgba(100, 181, 246, 0.1)"
                            backgroundImage={`url(${video.thumbnail})`}
                            backgroundSize="cover"
                            backgroundPosition="center"
                          >
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
                            >
                              <HiPlayCircle size={24} color="white" />
                            </Box>
                          </Box>
                          <Badge
                            position="absolute"
                            bottom="4px"
                            right="4px"
                            bg="rgba(0, 0, 0, 0.8)"
                            color="white"
                            fontSize="10px"
                            px="6px"
                            py="2px"
                            borderRadius="4px"
                          >
                            {video.duration}
                          </Badge>
                        </Box>

                        {/* Video Info */}
                        <Box flex="1" minW={0}>
                          <Text fontSize="sm" color="gray.400" fontWeight="600" mb="4px">
                            Video {index + 1}
                          </Text>
                          <Text
                            fontSize="14px"
                            fontWeight="700"
                            color="white"
                            lineHeight="1.4"
                            noOfLines={2}
                            mb="4px"
                          >
                            {video.title}
                          </Text>
                          <Text fontSize="xs" color="gray.400" noOfLines={1}>
                            {video.description}
                          </Text>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </MotionBox>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
