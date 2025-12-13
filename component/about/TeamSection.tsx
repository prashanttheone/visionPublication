'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface TeamMember {
  name: string;
  role: string;
  team: string;
  image: string;
  bio: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Sharma',
    role: 'Editor-in-Chief',
    team: 'Editorial Team',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: '20+ years in medical publishing',
  },
  {
    name: 'Priya Verma',
    role: 'Senior Editor',
    team: 'Editorial Team',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Expert in health sciences content',
  },
  {
    name: 'Rajesh Design',
    role: 'Creative Director',
    team: 'Design Team',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Award-winning publication design',
  },
  {
    name: 'Sarah Khan',
    role: 'Lead Designer',
    team: 'Design Team',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Specializes in educational materials',
  },
  {
    name: 'Amit Patel',
    role: 'Operations Manager',
    team: 'Publishing & Operations',
    image: 'https://images.unsplash.com/photo-1507527173202-83c92705a63b?w=400&h=400&fit=crop',
    bio: 'Streamlining publishing workflows',
  },
  {
    name: 'Lisa Anderson',
    role: 'Publishing Director',
    team: 'Publishing & Operations',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Leading digital transformation',
  },
  {
    name: 'Dr. Vikram Singh',
    role: 'Chief Executive Officer',
    team: 'Leadership',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Visionary leader in healthcare publishing',
  },
  {
    name: 'Neha Gupta',
    role: 'Chief Operating Officer',
    team: 'Leadership',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Building scalable publishing solutions',
  },
];

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

export default function TeamSection() {
  return (
    <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <MotionBox variants={itemVariants}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Our Team
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="20px">
              Meet Our Leadership & Experts
            </Text>
            <Text fontSize="md" color="gray.300" maxW="600px" mx="auto">
              Experienced professionals dedicated to excellence in healthcare publishing
            </Text>
          </MotionBox>
        </MotionBox>

        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="24px">
          {teamMembers.map((member, i) => (
            <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" overflow="hidden" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box width="100%" height="200px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                  <Box backgroundImage={`url(${member.image})`} backgroundSize="cover" backgroundPosition="center" width="100%" height="100%" />
                </Box>
                <Box p="20px">
                  <Text fontSize="lg" fontWeight="700" color="white" mb="4px">
                    {member.name}
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="#FF8C00" mb="4px">
                    {member.role}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mb="8px">
                    {member.team}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {member.bio}
                  </Text>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
