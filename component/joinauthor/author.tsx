'use client';

import { Box, Container, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiCheckCircle, HiSparkles, HiGlobeAlt, HiUserGroup, HiShieldCheck } from 'react-icons/hi2';
import { HiTrendingUp, HiX } from 'react-icons/hi';
import Invite from './invite';

const MotionBox = motion.create(Box);

export default function Author() {
  const [showInvite, setShowInvite] = useState(false);
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
      transition: { duration: 0.5 },
    },
    hover: {
      y: -12,
      boxShadow: '0 20px 40px rgba(100, 181, 246, 0.25)',
      transition: { duration: 0.3 },
    },
  };

  const benefits = [
    {
      icon: HiSparkles,
      title: 'Global Platform',
      description: 'Reach thousands of healthcare professionals and students worldwide with your expertise',
    },
    {
      icon: HiTrendingUp,
      title: 'Grow Your Audience',
      description: 'Build your professional brand and establish yourself as a thought leader in healthcare publishing',
    },
    {
      icon: HiUserGroup,
      title: 'Collaborative Community',
      description: 'Connect with fellow authors, editors, and industry experts in a supportive environment',
    },
    {
      icon: HiShieldCheck,
      title: 'Quality Publishing',
      description: 'Professional editing, design, and marketing support for your publications',
    },
    {
      icon: HiGlobeAlt,
      title: 'Wide Distribution',
      description: 'Your work distributed across multiple platforms and channels for maximum visibility',
    },
    {
      icon: HiCheckCircle,
      title: 'Seamless Process',
      description: 'User-friendly platform with dedicated support throughout your publishing journey',
    },
  ];

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1200px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        {/* Welcome Section */}
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center" mb={{ base: '60px', md: '80px' }}>
          <MotionBox variants={itemVariants} mb="20px">
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                Join Our Authors
              </Text>
            </Box>
          </MotionBox>

          <MotionBox variants={itemVariants} mb="30px">
            <Text fontSize={{ base: '36px', md: '52px', lg: '64px' }} fontWeight="900" lineHeight="1.2" color="white" mb="20px">
              Welcome to
            </Text>
            <Text fontSize={{ base: '36px', md: '52px', lg: '64px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              VisionPublications
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} maxW="800px" mx="auto" mb="40px">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.8" mb="20px">
              We believe in the power of knowledge and the importance of quality healthcare education. Our platform is dedicated to publishing exceptional works that advance nursing education, research, and practice.
            </Text>
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.8">
              Whether you're an experienced author or publishing for the first time, VisionPublications provides the support, resources, and platform you need to share your expertise with the global healthcare community.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Why Join Section */}
        <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb={{ base: '60px', md: '80px' }}>
          <Text fontSize={{ base: '32px', md: '42px' }} fontWeight="900" color="white" textAlign="center" mb={{ base: '50px', md: '60px' }}>
            Why Partner With Us
          </Text>

          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '24px', md: '32px' }}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <MotionBox key={index} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                  <Box
                    bg="rgba(30, 41, 59, 0.6)"
                    border="1px solid"
                    borderColor="rgba(100, 181, 246, 0.2)"
                    borderRadius="16px"
                    overflow="hidden"
                    backdropFilter="blur(10px)"
                    p={{ base: '28px', md: '32px' }}
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: 'rgba(100, 181, 246, 0.4)',
                    }}
                  >
                    {/* Icon */}
                    <Box
                      bg="linear-gradient(135deg, #64B5F6, #42A5F5)"
                      width="56px"
                      height="56px"
                      borderRadius="12px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb="20px"
                    >
                      <Icon size={28} color="white" />
                    </Box>

                    {/* Title */}
                    <Text fontSize={{ base: '18px', md: '20px' }} fontWeight="800" color="white" mb="12px">
                      {benefit.title}
                    </Text>

                    {/* Description */}
                    <Text fontSize="14px" color="gray.300" lineHeight="1.6" flex="1">
                      {benefit.description}
                    </Text>

                    {/* Accent Line */}
                    <Box height="2px" bg="linear-gradient(to-r, transparent, #FF8C00, transparent)" mt="20px" />
                  </Box>
                </MotionBox>
              );
            })}
          </Box>
        </MotionBox>

        {/* Call to Action */}
        <MotionBox
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          textAlign="center"
          bg="linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))"
          border="1px solid"
          borderColor="rgba(100, 181, 246, 0.2)"
          borderRadius="20px"
          p={{ base: '40px', md: '60px' }}
          backdropFilter="blur(10px)"
        >
          <Text fontSize={{ base: '24px', md: '32px' }} fontWeight="900" color="white" mb="16px">
            Ready to Share Your Knowledge?
          </Text>
          <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" mb="32px" maxW="600px" mx="auto">
            Join hundreds of healthcare professionals who trust VisionPublications to bring their work to the world. Fill out the form below to begin your publishing journey.
          </Text>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInvite(true)}
            style={{
              padding: '16px 48px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)',
            }}
          >
            Apply Now
          </motion.button>
        </MotionBox>

        {/* Invite Form Section - Inline Container */}
        {showInvite && (
          <MotionBox
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            mt={{ base: '60px', md: '80px' }}
          >
            <Box
              position="relative"
              mb={{ base: '40px', md: '60px' }}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInvite(false)}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
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
                <HiX size={24} />
              </motion.button>

              <Invite />
            </Box>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
