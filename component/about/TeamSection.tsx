'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MotionBox = motion.create(Box);

interface TeamMember {
  id: number;
  name: string;
  role: string;
  team: string;
  image_url: string;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team-members?active=true');
        const result = await response.json();
        
        if (result.success) {
          setTeamMembers(result.data || []);
        } else {
          console.error('Failed to fetch team members:', result.error);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <Box textAlign="center" mb="60px">
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Our Team
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="20px">
              Meet Our Leadership & Experts
            </Text>
            <Text fontSize="md" color="gray.300" maxW="600px" mx="auto">
              Loading team members...
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

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
            <MotionBox key={member.id} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" overflow="hidden" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box width="100%" height="200px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                  <Box backgroundImage={`url(${member.image_url})`} backgroundSize="cover" backgroundPosition="center" width="100%" height="100%" />
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
                    {member.bio || 'No bio available'}
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