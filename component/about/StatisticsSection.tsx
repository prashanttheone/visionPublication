'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiSparkles, HiHeart, HiUserGroup } from 'react-icons/hi2';
import { HiTrendingUp } from 'react-icons/hi';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

interface StatItem {
  label: string;
  value: string;
  icon: any;
}

const stats: StatItem[] = [
  { label: 'Books Published', value: '100+', icon: HiSparkles },
  { label: 'Happy Readers', value: '500K+', icon: HiHeart },
  { label: 'Expert Authors', value: '200+', icon: HiUserGroup },
  { label: 'Growth Rate', value: '75%', icon: HiTrendingUp },
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
    transition: { duration: 0.5 },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(100, 181, 246, 0.2)',
    transition: { duration: 0.2 },
  },
};

export default function StatisticsSection() {
  return (
    <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <MotionBox variants={itemVariants}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Our Impact
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
              By The Numbers
            </Text>
          </MotionBox>
        </MotionBox>

        <Grid gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap="24px">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" textAlign="center" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                  <Box fontSize="40px" mb="16px" display="inline-block" color="#64B5F6">
                    <Icon size={40} />
                  </Box>
                  <Text fontSize={{ base: '32px', md: '40px' }} fontWeight="900" color="#FF8C00" mb="8px">
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color="gray.400" fontWeight="600">
                    {stat.label}
                  </Text>
                </Box>
              </MotionBox>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
