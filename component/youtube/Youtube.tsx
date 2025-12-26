'use client';

import { Box, Container, Text, Badge, IconButton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiPlayCircle, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

interface YouTubePlaylist {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  totalDuration: string;
  category: string;
}

export default function Youtube() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  // Dummy playlist data
  useEffect(() => {
    const dummyPlaylists: YouTubePlaylist[] = [
      {
        id: 1,
        title: 'Obstetrics and Midwifery Nursing',
        description: 'Comprehensive guide to obstetrics and midwifery nursing practices',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        videoCount: 85,
        totalDuration: '12h 30m',
        category: 'Clinical Nursing',
      },
      {
        id: 2,
        title: 'Psychology in Healthcare',
        description: 'Understanding patient psychology and mental health in medical settings',
        thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        videoCount: 34,
        totalDuration: '8h 15m',
        category: 'Mental Health',
      },
      {
        id: 3,
        title: 'Community Health Nursing',
        description: 'Public health nursing and community care strategies',
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
        videoCount: 100,
        totalDuration: '15h 45m',
        category: 'Public Health',
      },
      {
        id: 4,
        title: 'Fundamental of Nursing',
        description: 'Core nursing principles and basic patient care techniques',
        thumbnail: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
        videoCount: 90,
        totalDuration: '14h 20m',
        category: 'Basics',
      },
      {
        id: 5,
        title: 'Pathology & Genetics',
        description: 'Disease mechanisms and genetic factors in healthcare',
        thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        videoCount: 21,
        totalDuration: '5h 45m',
        category: 'Medical Science',
      },
      {
        id: 6,
        title: 'Medical Surgical Nursing',
        description: 'Surgical procedures and perioperative nursing care',
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
        videoCount: 175,
        totalDuration: '22h 30m',
        category: 'Surgical',
      },
    ];

    setPlaylists(dummyPlaylists);
    setIsLoading(false);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(playlists.length - cardsPerView, prev + 1));
  };

  const handlePlaylistClick = (playlistId: number) => {
    router.push(`/ytplaylist/${playlistId}`);
  };

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

  const visiblePlaylists = playlists.slice(currentIndex, currentIndex + cardsPerView);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < playlists.length - cardsPerView;

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
              Playlists
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Explore our curated playlists covering healthcare education, clinical practices, research insights, and professional development.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Playlists Carousel */}
        {isLoading ? (
          <Box textAlign="center" py="60px">
            <Text color="white" fontSize="18px" fontWeight="700">
              Loading playlists...
            </Text>
          </Box>
        ) : playlists.length === 0 ? (
          <Box textAlign="center" py="60px">
            <Text color="gray.300" fontSize="18px" fontWeight="700">
              No playlists available
            </Text>
          </Box>
        ) : (
          <Box position="relative">
            {/* Carousel Navigation Buttons */}
            {canGoPrevious && (
              <IconButton
                aria-label="Previous"
                icon={<HiChevronLeft />}
                position="absolute"
                left="-20px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                onClick={handlePrevious}
                bg="rgba(100, 181, 246, 0.2)"
                _hover={{ bg: 'rgba(100, 181, 246, 0.3)' }}
                color="white"
                size="lg"
                borderRadius="full"
                display={{ base: 'none', lg: 'flex' }}
              />
            )}

            {canGoNext && (
              <IconButton
                aria-label="Next"
                icon={<HiChevronRight />}
                position="absolute"
                right="-20px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                onClick={handleNext}
                bg="rgba(100, 181, 246, 0.2)"
                _hover={{ bg: 'rgba(100, 181, 246, 0.3)' }}
                color="white"
                size="lg"
                borderRadius="full"
                display={{ base: 'none', lg: 'flex' }}
              />
            )}

            {/* Carousel Content */}
            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={{ base: '24px', md: '28px' }}
            >
              {(visiblePlaylists.length > 0 ? visiblePlaylists : playlists.slice(0, 4)).map((playlist) => (
                <MotionBox key={playlist.id} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
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
                    cursor="pointer"
                    onClick={() => handlePlaylistClick(playlist.id)}
                    _hover={{
                      borderColor: 'rgba(100, 181, 246, 0.4)',
                    }}
                  >
                    {/* Playlist Thumbnail */}
                    <Box
                      position="relative"
                      width="100%"
                      height="180px"
                      overflow="hidden"
                      bg="rgba(100, 181, 246, 0.1)"
                      backgroundImage={`url(${playlist.thumbnail})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
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

                      {/* Video Count Badge */}
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
                        {playlist.videoCount} videos
                      </Badge>
                    </Box>

                    {/* Card Footer */}
                    <Box p={{ base: '16px', md: '20px' }} flex="1" display="flex" flexDirection="column">
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                        mb="8px"
                        w="fit-content"
                      >
                        {playlist.category}
                      </Badge>

                      <Text fontSize={{ base: '15px', md: '16px' }} fontWeight="800" color="white" lineHeight="1.4" mb="8px">
                        {playlist.title}
                      </Text>

                      <Text fontSize="sm" color="gray.300" lineHeight="1.5" flex="1" noOfLines={2}>
                        {playlist.description}
                      </Text>

                      <Text fontSize="xs" color="gray.400" mt="12px">
                        {playlist.totalDuration} total
                      </Text>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
