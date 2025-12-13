'use client';

import { Box, Container, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Carousel from './Carousel';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

export default function Home() {
  const router = useRouter();
  
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

  return (
    <>
      {/* Hero Section */}
      <Box
      minH="100vh"
      bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: '60px', md: '80px' }}
    >
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        width="400px"
        height="400px"
        borderRadius="50%"
        bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)"
        filter="blur(40px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-50px"
        left="-50px"
        width="300px"
        height="300px"
        borderRadius="50%"
        bgGradient="radial(circle, rgba(100, 181, 246, 0.05) 0%, transparent 70%)"
        filter="blur(40px)"
        pointerEvents="none"
      />

      <Container maxW="1200px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          textAlign="center"
        >
          {/* Main Heading */}
          <Box mb={{ base: '40px', md: '60px' }}>
            <MotionBox variants={itemVariants} mb="20px">
              <Text
                fontSize={{ base: '48px', md: '72px', lg: '84px' }}
                fontWeight="900"
                lineHeight="1.1"
                color="white"
                display="inline"
              >
                Welcome to
              </Text>
            </MotionBox>

            <MotionBox variants={highlightVariants} display="inline-block" position="relative">
              <Box
                bg="linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)"
                px={{ base: '12px', md: '20px' }}
                py={{ base: '8px', md: '12px' }}
                transform="skewX(-10deg)"
                display="inline-block"
              >
                <Text
                  fontSize={{ base: '48px', md: '72px', lg: '84px' }}
                  fontWeight="900"
                  color="black"
                  transform="skewX(10deg)"
                  display="block"
                >
                  Vision
                </Text>
              </Box>
            </MotionBox>

            {/* Badge */}
            <MotionBox
              variants={badgeVariants}
              whileHover="hover"
              display="inline-block"
              ml={{ base: '8px', md: '12px' }}
              position="relative"
              top={{ base: '-8px', md: '-12px' }}
            >
              <Box
                width={{ base: '60px', md: '80px' }}
                height={{ base: '60px', md: '80px' }}
                bgGradient="linear(to-br, #FF8C00, #FFA500)"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(255, 140, 0, 0.4)"
                position="relative"
                border="3px solid rgba(255, 255, 255, 0.1)"
              >
                <Box textAlign="center">
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" color="white">
                    Vision
                  </Text>
                  <Box fontSize={{ base: '20px', md: '28px' }} color="white" mt={1}>
                    🛡️
                  </Box>
                </Box>
              </Box>
            </MotionBox>

            {/* Second and Third Lines */}
            <MotionBox variants={itemVariants}>
              <Text
                fontSize={{ base: '48px', md: '72px', lg: '84px' }}
                fontWeight="900"
                lineHeight="1.1"
                color="white"
              >
                Health Sciences Publishers.
              </Text>
            </MotionBox>
          </Box>

          {/* Description Text */}
          <MotionBox variants={itemVariants} maxW="900px" mx="auto">
            <Text
              fontSize={{ base: '16px', md: '18px' }}
              lineHeight="1.8"
              color="gray.300"
              fontWeight="500"
            >
              We Aim to Publish Relevant, Timely and Informative Literature to Serve the Nursing
              and Allied Health Sciences Community. We are Committed to Continually Improving all
              Aspects of Teaching and Learning. Through Publishing Quality Textbooks, We Will Create
              a Better Tomorrow.
            </Text>
          </MotionBox>

          {/* CTA Buttons */}
          <MotionBox variants={itemVariants} mt={{ base: '50px', md: '70px' }} display="flex" gap="20px" justifyContent="center" flexWrap="wrap">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/books')}
              style={{
                padding: '14px 32px',
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
              Explore Publications
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#64B5F6', boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid rgba(100, 181, 246, 0.5)',
                borderRadius: '8px',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Learn More
            </motion.button>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>

      {/* Carousel Section */}
      <Carousel />
    </>
  );
}
