'use client';

import { Box, Container, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
const MotionBox = motion.create(Box);

interface Review {
  id: number;
  name: string;
  role: string;
  institution: string;
  image: string;
  message: string;
  rating: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'B.Sc Nursing Student',
    institution: 'Delhi Medical College',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    message:
      'The textbooks from Vision Health Sciences have been instrumental in my nursing studies. The content is comprehensive, well-organized, and incredibly helpful for both classroom learning and clinical practice.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Dr. Rajesh Kumar',
    role: 'Assistant Professor',
    institution: 'AIIMS Delhi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    message:
      'I have been recommending Vision Health Sciences publications to my students for years. The quality of content and attention to detail in these books sets them apart from competitors.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'M.Sc Allied Health Sciences',
    institution: 'St. Stephen\'s College',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    message:
      'Excellent resource for my postgraduate studies. The books cover advanced topics with clarity and include practical examples that helped me excel in my exams and research projects.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Dr. Amit Singh',
    role: 'Clinical Practitioner',
    institution: 'Max Healthcare',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    message:
      'These publications keep me updated with the latest developments in healthcare. The evidence-based approach and practical insights are invaluable for my clinical practice.',
    rating: 4,
  },
  {
    id: 5,
    name: 'Emily Watson',
    role: 'B.Sc Healthcare Management',
    institution: 'Oxford Brookes University',
    image: 'https://images.unsplash.com/photo-1507527173202-83c92705a63b?w=400&h=400&fit=crop',
    message:
      'Vision Health Sciences books are a goldmine of information. They bridge the gap between theory and practice beautifully. Highly recommended for health sciences students worldwide.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Dr. Lisa Anderson',
    role: 'Head of Department',
    institution: 'Mayo Clinic Academy',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    message:
      'The comprehensive curriculum design in these textbooks has transformed our teaching methodology. Our students consistently score higher and have better clinical competency.',
    rating: 5,
  },
];

export default function Review() {
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const renderStars = (rating: number) => {
    return (
      <Box display="flex" gap="4px" mb="16px">
        {Array.from({ length: 5 }).map((_, i) => (
          <HiStar
            key={i}
            size={20}
            color={i < rating ? '#FFD700' : '#4A5568'}
            style={{ fill: i < rating ? '#FFD700' : 'none' }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box
      bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)"
      py={{ base: '60px', md: '80px' }}
      position="relative"
      overflow="hidden"
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
        bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)"
        filter="blur(40px)"
        pointerEvents="none"
      />

      <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
        {/* Header Section */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          textAlign="center"
          mb={{ base: '60px', md: '80px' }}
        >
          {/* Badge */}
          <MotionBox variants={itemVariants} mb="20px">
            <Box
              display="inline-block"
              bg="rgba(255, 140, 0, 0.1)"
              border="2px solid"
              borderColor="rgba(255, 140, 0, 0.5)"
              px="16px"
              py="8px"
              borderRadius="50px"
            >
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                What Our Readers Say
              </Text>
            </Box>
          </MotionBox>

          {/* Heading */}
          <MotionBox variants={itemVariants}>
            <Text
              fontSize={{ base: '42px', md: '56px', lg: '64px' }}
              fontWeight="900"
              lineHeight="1.2"
              color="white"
              mb="20px"
            >
              Trusted by
            </Text>
            <Text
              fontSize={{ base: '42px', md: '56px', lg: '64px' }}
              fontWeight="900"
              lineHeight="1.2"
              bgGradient="linear(to-r, #64B5F6, #90CAF9)"
              bgClip="text"
              mb="20px"
            >
              Students & Professionals
            </Text>
          </MotionBox>

          {/* Description */}
          <MotionBox variants={itemVariants} maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Read authentic reviews from students, educators, and healthcare professionals who have benefited from our publications.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Reviews Grid */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={{ base: '24px', md: '32px' }}
        >
          {reviews.map((review, index) => (
            <MotionBox key={review.id} variants={itemVariants} whileHover="hover">
              <motion.div variants={cardVariants} whileHover="hover">
                <Box
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  borderRadius="16px"
                  p={{ base: '24px', md: '28px' }}
                  backdropFilter="blur(10px)"
                  display="flex"
                  flexDirection="column"
                  height="100%"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: 'rgba(100, 181, 246, 0.4)',
                  }}
                >
                  {/* Star Rating */}
                  {renderStars(review.rating)}

                  {/* Review Message */}
                  <Text
                    fontSize={{ base: '14px', md: '15px' }}
                    color="gray.300"
                    lineHeight="1.7"
                    mb="24px"
                    flex="1"
                    fontWeight="500"
                  >
                    "{review.message}"
                  </Text>

                  {/* Divider */}
                  <Box
                    height="1px"
                    bg="linear-gradient(to-r, transparent, rgba(100, 181, 246, 0.2), transparent)"
                    mb="20px"
                  />

                  {/* Footer Card - Reviewer Info */}
                  <Box
                    display="flex"
                    gap="16px"
                    alignItems="flex-start"
                  >
                    {/* Avatar Image */}
                    <Box
                      width="60px"
                      height="60px"
                      borderRadius="12px"
                      overflow="hidden"
                      flexShrink={0}
                      border="2px solid"
                      borderColor="rgba(100, 181, 246, 0.3)"
                      position="relative"
                    >
                      <Box
                        backgroundImage={`url(${review.image})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        width="100%"
                        height="100%"
                      />
                    </Box>

                    {/* Name and Details */}
                    <Box flex="1">
                      {/* Name */}
                      <Text
                        fontSize="md"
                        fontWeight="700"
                        color="white"
                        mb="4px"
                        display="block"
                      >
                        {review.name}
                      </Text>

                      {/* Role */}
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="#FF8C00"
                        mb="2px"
                        display="block"
                      >
                        {review.role}
                      </Text>

                      {/* Institution */}
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="500"
                        display="block"
                      >
                        {review.institution}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </MotionBox>
          ))}
        </Box>

        {/* CTA Section */}
        <MotionBox
          variants={itemVariants}
          textAlign="center"
          mt={{ base: '60px', md: '80px' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" mb="24px">
            Join thousands of satisfied readers worldwide
          </Text>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '14px 40px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)',
            }}
             onClick={() => { router.push('/books') }}
          >
            Explore Our Books
          </motion.button>
        </MotionBox>
      </Container>
    </Box>
  );
}
