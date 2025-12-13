'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

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
    y: -8,
    boxShadow: '0 20px 40px rgba(100, 181, 246, 0.2)',
    transition: { duration: 0.2 },
  },
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

export default function WhatWeDoSection() {
  const services = [
    { icon: '✍️', title: 'Content Development', desc: 'Expert writing and content creation for healthcare publications' },
    { icon: '📐', title: 'Editorial Services', desc: 'Comprehensive editing and quality assurance processes' },
    { icon: '🎨', title: 'Design & Layout', desc: 'Professional design and publication formatting' },
    { icon: '💻', title: 'Digital Publishing', desc: 'E-books and digital-first publishing solutions' },
    { icon: '🔍', title: 'Author Support', desc: 'Complete guidance from manuscript to publication' },
    { icon: '📊', title: 'Distribution', desc: 'Wide distribution through multiple channels' },
  ];

  return (
    <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <MotionBox variants={itemVariants}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Our Services
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
              What We Do & Our Expertise
            </Text>
          </MotionBox>
        </MotionBox>

        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="24px">
          {services.map((service, i) => (
            <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="24px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }} height="100%">
                <Box fontSize="40px" mb="12px">
                  {service.icon}
                </Box>
                <Text fontSize="lg" fontWeight="700" color="white" mb="8px">
                  {service.title}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {service.desc}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
