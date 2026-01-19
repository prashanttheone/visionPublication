'use client';

import { Box, Container, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
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

export default function CTASection() {
  const router = useRouter();

  return (
    <Box py={{ base: '60px', md: '100px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        <MotionBox textAlign="center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <MotionBox variants={itemVariants} mb="40px">
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="20px">
              Ready to Make an Impact?
            </Text>
            <Text fontSize="md" color="gray.300" maxW="600px" mx="auto" mb="40px">
              Join our community of authors, educators, and students transforming healthcare education
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants} display="flex" gap="20px" justifyContent="center" flexWrap="wrap">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '16px 48px',
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
              Publish With Us
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#64B5F6', boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid rgba(100, 181, 246, 0.5)',
                borderRadius: '8px',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => { router.push('/books') }}
            >
              Explore Our Booksss
            </motion.button>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}
