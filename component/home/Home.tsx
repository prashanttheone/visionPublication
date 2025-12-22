'use client';

import { Box, Container, Text, Flex, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Carousel from './Carousel';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);
const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

export default function Home() {
  const router = useRouter();
  const fullText = "Welcome to India's Leading Publishing VisionPublication";
  const [showBook, setShowBook] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const highlightVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, delay: 0.3 },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.5 },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };

  // Show book after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowBook(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        pt={{ base: '0', md: '0' }}
        pb={{ base: '40px', md: '60px', lg: '80px', xl: '100px' }}
        px={{ base: '16px', md: '24px' }}
        position="relative"
        overflow="hidden"
        minH={{ base: 'auto', lg: '600px' }}
      >
        <Container maxW="container.xl">
          <MotionFlex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={{ base: 6, md: 8, lg: 12 }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Text Content with Typewriter Effect */}
            <Box 
              flex={{ base: '1', lg: '0 0 45%' }} 
              textAlign={{ base: 'center', lg: 'left' }}
              mb={{ base: 4, lg: 0 }}
            >
              <MotionText
                fontSize={{ base: '24px', sm: '28px', md: '36px', lg: '40px', xl: '48px' }}
                fontWeight="bold"
                color="white"
                lineHeight="1.3"
                position="relative"
                px={{ base: 2, md: 0 }}
              >
                {fullText}
              </MotionText>
            </Box>

            {/* Animated Book Cover */}
            <MotionBox
              w={{ base: '100%', sm: '90%', md: '80%', lg: '55%' }}
              maxW={{ base: '400px', md: '500px', lg: 'none' }}
              mx={{ base: 'auto', lg: 0 }}
              position="relative"
            >
              {showBook && (
                <MotionBox
                  position="relative"
                  w="100%"
                  h={{ base: '300px', sm: '350px', md: '450px', lg: '500px', xl: '600px' }}
                >
                  {/* Book Cover Image - Base Layer */}
                  <MotionImage
                    src="/HeroBook.jpeg"
                    alt="VisionPublication Book Cover"
                    w="100%"
                    h="100%"
                    objectFit="contain"
                    borderRadius={{ base: '8px', md: '12px' }}
                    boxShadow="2xl"
                    position="absolute"
                    top={0}
                    left={0}
                    fallback={
                      <Box
                        w="100%"
                        h="100%"
                        bg="white"
                        borderRadius={{ base: '8px', md: '12px' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                        p={{ base: 4, md: 8 }}
                        boxShadow="2xl"
                      >
                        <Text fontSize={{ base: '4xl', md: '6xl' }} mb={{ base: 2, md: 4 }}>📚</Text>
                        <Text 
                          fontSize={{ base: 'xl', md: '2xl' }} 
                          fontWeight="bold" 
                          color="purple.600" 
                          textAlign="center"
                          px={2}
                        >
                          VisionPublication
                        </Text>
                        <Text 
                          fontSize={{ base: 'sm', md: 'lg' }} 
                          color="gray.600" 
                          mt={2} 
                          textAlign="center"
                          px={2}
                        >
                          Quality Educational Books
                        </Text>
                      </Box>
                    }
                  />
                  
                  {/* 5 Colored Cards that disappear one by one from left to right */}
                  {[0, 1, 2, 3, 4].map((index) => (
                    <MotionBox
                      key={index}
                      position="absolute"
                      top={0}
                      left={`${index * 20}%`}
                      w="20%"
                      h="100%"
                      bg="#f3f5eb"
                      initial={{ scaleX: 1, opacity: 1 }}
                      animate={{ scaleX: 0, opacity: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.5,
                        ease: [0.42, 0, 0.58, 1],
                      }}
                      style={{
                        transformOrigin: 'right',
                      }}
                      borderRadius={
                        index === 0 
                          ? { base: '8px 0 0 8px', md: '12px 0 0 12px' }
                          : index === 4 
                          ? { base: '0 8px 8px 0', md: '0 12px 12px 0' }
                          : '0'
                      }
                    />
                  ))}
                </MotionBox>
              )}
            </MotionBox>
          </MotionFlex>
        </Container>
      </Box>

      {/* Carousel Section */}
      <Carousel />


    </>
  );
}
