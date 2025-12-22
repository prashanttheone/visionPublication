'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: 'Quality Education',
    description: 'Publishing innovative textbooks that shape the future of healthcare education',
    image_url: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=1200&h=600&fit=crop',
    link_url: '/books',
    display_order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: 'Expert Insights',
    description: 'Curated content from leading healthcare professionals and researchers',
    image_url: 'https://images.unsplash.com/photo-1491841573634-28fb1df32293?w=1200&h=600&fit=crop',
    link_url: '/about',
    display_order: 2,
    is_active: true,
  },
  {
    id: 3,
    title: 'Digital Innovation',
    description: 'Modern publishing solutions for the digital age of learning',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    link_url: '/resources',
    display_order: 3,
    is_active: true,
  },
  {
    id: 4,
    title: 'Global Reach',
    description: 'Serving healthcare professionals and students worldwide',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    link_url: '/about',
    display_order: 4,
    is_active: true,
  },
  {
    id: 5,
    title: 'Knowledge Hub',
    description: 'Comprehensive resources for continuous learning and development',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=1200&h=600&fit=crop',
    link_url: '/resources',
    display_order: 5,
    is_active: true,
  },
];

export default function Carousel() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch sliders from API
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('/api/home/slider?active=true');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setCarouselItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || carouselItems.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, carouselItems.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  const pagingVariants = {
    active: { scale: 1.2, opacity: 1 },
    inactive: { scale: 0.8, opacity: 0.5 },
  };

  const handleLearnMore = (link_url?: string) => {
    if (link_url) {
      if (link_url.startsWith('http')) {
        window.open(link_url, '_blank');
      } else {
        router.push(link_url);
      }
    }
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setDirection(1);
    setCurrent((prev) => (prev + 1) % carouselItems.length);
    setTimeout(() => setIsAutoPlay(true), 7000);
  };

  const handlePrev = () => {
    setIsAutoPlay(false);
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    setTimeout(() => setIsAutoPlay(true), 7000);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlay(false);
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    setTimeout(() => setIsAutoPlay(true), 7000);
  };

  return (
    <Box
      width="100%"
      bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)"
      py={{ base: '60px', md: '80px' }}
      position="relative"
      overflow="hidden"
    >
      {loading ? (
        <Container maxW="full" px={0}>
          <Box
            height={{ base: '350px', md: '500px', lg: '600px' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="xl">Loading sliders...</Text>
          </Box>
        </Container>
      ) : carouselItems.length === 0 ? (
        <Container maxW="full" px={0}>
          <Box
            height={{ base: '350px', md: '500px', lg: '600px' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="xl">No active sliders found</Text>
          </Box>
        </Container>
      ) : (
        <Container maxW="full" px={0}>
        {/* Main Carousel Container */}
        <Box
          position="relative"
          width="100%"
          maxW="100%"
          height={{ base: '350px', md: '500px', lg: '600px' }}
          overflow="hidden"
          borderRadius={{ base: '0', md: '16px' }}
          mx={{ base: 0, md: 'auto' }}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* Carousel Slides */}
          <AnimatePresence initial={false} custom={direction}>
            {carouselItems.map((item, index) => {
              if (index === current) {
                return (
                  <MotionBox
                    key={item.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.5 },
                    }}
                    position="absolute"
                    width="100%"
                    height="100%"
                  >
                    {/* Background Image */}
                    <Box
                      backgroundImage={`url(${item.image_url})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                      width="100%"
                      height="100%"
                      position="absolute"
                    />

                    {/* Overlay Gradient */}
                    <MotionBox
                      variants={overlayVariants}
                      initial="hidden"
                      animate="visible"
                      position="absolute"
                      inset={0}
                      bgGradient="linear(to-r, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.4) 100%)"
                    />

                    {/* Content */}
                    <Box
                      position="absolute"
                      inset={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                      px={{ base: '20px', md: '40px', lg: '60px' }}
                    >
                      <MotionBox
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                        maxW={{ base: '100%', md: '600px' }}
                      >
                        {/* Title */}
                        <Text
                          fontSize={{ base: '32px', md: '48px', lg: '56px' }}
                          fontWeight="900"
                          color="white"
                          lineHeight="1.2"
                          mb="16px"
                          textShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
                        >
                          {item.title}
                        </Text>

                        {/* Description */}
                        <Text
                          fontSize={{ base: '14px', md: '16px', lg: '18px' }}
                          color="gray.200"
                          lineHeight="1.6"
                          maxW="500px"
                          mb="24px"
                        >
                          {item.description}
                        </Text>

                        {/* CTA Button */}
                        <motion.button
                          onClick={() => handleLearnMore(item.link_url)}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 20px 40px rgba(100, 181, 246, 0.4)',
                          }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '12px 28px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #64B5F6, #42A5F5)',
                            color: 'white',
                            cursor: item.link_url ? 'pointer' : 'default',
                            boxShadow: '0 10px 30px rgba(100, 181, 246, 0.3)',
                            opacity: item.link_url ? 1 : 0.5,
                          }}
                        >
                          Learn More
                        </motion.button>
                      </MotionBox>
                    </Box>
                  </MotionBox>
                );
              }
              return null;
            })}
          </AnimatePresence>

          {/* Navigation Arrows */}
          <Box
            position="absolute"
            top="50%"
            transform="translateY(-50%)"
            left={{ base: '10px', md: '20px' }}
            zIndex={10}
          >
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.15, x: -5 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'rgba(100, 181, 246, 0.2)',
                border: '2px solid rgba(100, 181, 246, 0.5)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64B5F6',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
              aria-label="Previous slide"
            >
              <HiChevronLeft size={24} />
            </motion.button>
          </Box>

          <Box
            position="absolute"
            top="50%"
            transform="translateY(-50%)"
            right={{ base: '10px', md: '20px' }}
            zIndex={10}
          >
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.15, x: 5 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'rgba(100, 181, 246, 0.2)',
                border: '2px solid rgba(100, 181, 246, 0.5)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64B5F6',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
              aria-label="Next slide"
            >
              <HiChevronRight size={24} />
            </motion.button>
          </Box>

          {/* Pagination Dots */}
          <Box
            position="absolute"
            bottom="20px"
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            display="flex"
            gap="12px"
            alignItems="center"
          >
            {carouselItems.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => handleDotClick(index)}
                variants={pagingVariants}
                animate={index === current ? 'active' : 'inactive'}
                style={{
                  width: index === current ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background:
                    index === current
                      ? 'linear-gradient(135deg, #64B5F6, #42A5F5)'
                      : 'rgba(100, 181, 246, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                whileHover={{
                  background:
                    index === current
                      ? 'linear-gradient(135deg, #64B5F6, #42A5F5)'
                      : 'rgba(100, 181, 246, 0.6)',
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </Box>
        </Box>

        {/* Slide Counter */}
        <Box
          textAlign="center"
          mt="30px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap="10px"
        >
        </Box>
      </Container>
      )}
    </Box>
  );
}
