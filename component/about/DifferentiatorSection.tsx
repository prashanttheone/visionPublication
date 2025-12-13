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

export default function DifferentiatorSection() {
  const differentiators = [
    { icon: '🎓', title: 'Academic Excellence', desc: 'Rigorous peer review and expert-authored content' },
    { icon: '🌍', title: 'Global Reach', desc: 'Distributed and trusted by educators worldwide' },
    { icon: '💼', title: 'Industry Expertise', desc: '14+ years of specialized healthcare publishing' },
    { icon: '🚀', title: 'Innovation', desc: 'Pioneering digital and interactive learning solutions' },
    { icon: '💰', title: 'Value for Money', desc: 'Affordable pricing without compromising quality' },
    { icon: '🤝', title: 'Author Focus', desc: 'Dedicated support from conception to publication' },
  ];

  return (
    <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <MotionBox variants={itemVariants}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Why Choose Us
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
              What Sets Us Apart
            </Text>
          </MotionBox>
        </MotionBox>

        <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="32px">
          {differentiators.map((diff, i) => (
            <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box fontSize="48px" mb="16px">
                  {diff.icon}
                </Box>
                <Text fontSize="lg" fontWeight="700" color="white" mb="12px">
                  {diff.title}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {diff.desc}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
