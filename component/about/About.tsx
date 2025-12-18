'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiCheckCircle } from 'react-icons/hi2';
import StatisticsSection from './StatisticsSection';
import TeamSection from './TeamSection';
import DifferentiatorSection from './DifferentiatorSection';
import CTASection from './CTASection';
import WhatWeDoSection from './WhatWeDoSection';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

const values = [
  {
    title: 'Excellence',
    description: 'Unwavering commitment to the highest quality in every publication',
  },
  {
    title: 'Innovation',
    description: 'Embracing technology and new approaches in educational publishing',
  },
  {
    title: 'Integrity',
    description: 'Maintaining ethical standards and transparency in all operations',
  },
  {
    title: 'Impact',
    description: 'Creating meaningful change in healthcare education globally',
  },
  {
    title: 'Collaboration',
    description: 'Partnering with experts to deliver comprehensive solutions',
  },
  {
    title: 'Accessibility',
    description: 'Making quality healthcare knowledge available to everyone',
  },
];

export default function About() {
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

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      {/* Hero Section */}
      <Box 
        py={{ base: '80px', md: '120px' }} 
        position="relative" 
        zIndex={1}
        overflow="hidden"
      >
        {/* Background Image with Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundImage="url('/aboutBg.jpeg')"
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          opacity="0.3"
          zIndex={0}
        />
        
        {/* Dark Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          background="linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(26, 35, 50, 0.8) 50%, rgba(15, 23, 42, 0.85) 100%)"
          zIndex={1}
        />

        {/* Animated particles/dots background */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex={2}>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              width="4px"
              height="4px"
              borderRadius="50%"
              bg="rgba(100, 181, 246, 0.3)"
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              animation={`float ${5 + Math.random() * 5}s ease-in-out infinite`}
              style={{
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </Box>

        <Container maxW="1200px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={3}>
          <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center">
            <MotionBox variants={itemVariants} mb="30px">
              <Box 
                display="inline-block" 
                bg="rgba(255, 140, 0, 0.15)" 
                border="2px solid" 
                borderColor="rgba(255, 140, 0, 0.6)" 
                px="20px" 
                py="10px" 
                borderRadius="50px"
                boxShadow="0 0 30px rgba(255, 140, 0, 0.3)"
                _hover={{
                  boxShadow: '0 0 40px rgba(255, 140, 0, 0.5)',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.3s ease"
              >
                <Text 
                  fontSize="sm" 
                  fontWeight="700" 
                  color="#FF8C00" 
                  textTransform="uppercase" 
                  letterSpacing="2px"
                  textShadow="0 0 20px rgba(255, 140, 0, 0.6)"
                >
                  About Vision
                </Text>
              </Box>
            </MotionBox>

            <MotionBox 
              variants={itemVariants} 
              mb="40px"
              position="relative"
            >
              {/* Main Heading with Advanced Animations */}
              <MotionText
                fontSize={{ base: '36px', md: '52px', lg: '68px' }} 
                fontWeight="800" 
                lineHeight="1.2" 
                mb="24px"
                style={{
                  background: 'linear-gradient(135deg,rgb(97, 83, 252) 0%,rgb(58, 129, 223) 50%, #fcf453 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 40px rgba(42, 152, 215, 0.5)',
                  filter: 'drop-shadow(0 0 30px rgba(57, 23, 191, 0.6)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.4))',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                Hey There! Welcome to <br />
                Vision Health Science Publishers
              </MotionText>

              {/* Subtitle with Gradient Animation */}
              <MotionText 
                fontSize={{ base: '38px', md: '54px', lg: '72px' }} 
                fontWeight="900" 
                lineHeight="1.2"
                position="relative"
                display="inline-block"
                style={{
                  background: 'linear-gradient(90deg, #64B5F6 0%, #90CAF9 25%, #42A5F5 50%, #90CAF9 75%, #64B5F6 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(100, 181, 246, 0.8)) drop-shadow(0 0 80px rgba(100, 181, 246, 0.5))',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                Education Worldwide
              </MotionText>

              {/* Glow effect behind text */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="100%"
                height="100%"
                bg="radial-gradient(circle, rgba(100, 181, 246, 0.2) 0%, transparent 70%)"
                filter="blur(60px)"
                zIndex={-1}
                animation="pulse 3s ease-in-out infinite"
              />
            </MotionBox>

            <MotionBox variants={itemVariants} maxW="800px" mx="auto">
              <Text 
                fontSize={{ base: '16px', md: '18px', lg: '20px' }} 
                fontWeight="700"
                lineHeight="1.9"
                style={{
                  color: 'rgba(226, 232, 240, 0.9)',
                  textShadow: '0 0 20px rgba(226, 232, 240, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                Established in 2018, Vision Health Sciences publishers has been in the forefront of educational publishing in the field of Nursing and allied health sciences since its inception. With its commitment to developing and bringing about quality education in the form of teaching and learning material (TLM)* for students and facilitators of Nursing and allied health sciences.
                The Company is aimed at publishing students-friendly and curriculum-based books for different subjects in the field of Nursing and allied health sciences.
                The Company is committed to developing an integrated teaching learning materials to meet the academic requirements of the undergraduate and postgraduate nursing, pharmacy, BAMS & Allied health sciences students.
              </Text>
            </MotionBox>
          </MotionBox>
        </Container>

        {/* Custom CSS Animations */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.6;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
        `}</style>
      </Box>

      {/* Who We Are Section */}
      <Box py={{ base: '60px', md: '100px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)" overflow="hidden">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <Grid gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: '40px', lg: '60px' }} alignItems="center">
            {/* Left Side - Text Content (slides in from left) */}
            <MotionBox 
              initial={{ opacity: 0, x: -100 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="2px">
                Meet Our Founders
              </Text>
              
              {/* Founder Names with Glow Effect */}
              <Box mb="24px">
                <Text 
                  fontSize={{ base: '28px', md: '36px' }} 
                  fontWeight="900" 
                  lineHeight="1.3"
                  mb="8px"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(255, 140, 0, 0.5))',
                  }}
                >
                  DR. BHARAT PAREEK
                </Text>
                <Text 
                  fontSize={{ base: '20px', md: '24px' }} 
                  fontWeight="700" 
                  color="#64B5F6" 
                  mb="8px"
                  style={{
                    textShadow: '0 0 15px rgba(100, 181, 246, 0.5)',
                  }}
                >
                  &
                </Text>
                <Text 
                  fontSize={{ base: '28px', md: '36px' }} 
                  fontWeight="900" 
                  lineHeight="1.3"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(255, 140, 0, 0.5))',
                  }}
                >
                  MR. ANUBHAV PURI
                </Text>
              </Box>

              <Text fontSize="md" color="gray.300" lineHeight="1.9" mb="20px">
                We are dedicated to making quality educational resources affordable and accessible to nursing, paramedical, and medical students. Our goal is to provide student-friendly books that enhance learning while reducing financial strain, ensuring that education remains a right, not a privilege.
              </Text>
              
              <Text fontSize="md" color="gray.300" lineHeight="1.9" mb="20px">
                Beyond academics, we are deeply committed to supporting the nursing community. Nurses are the backbone of healthcare, and we aim to create an ecosystem where they receive both financial and personal support during critical times. A portion of our income is allocated to initiatives that directly benefit nurses, reinforcing our mission to give back to those who serve the healthcare system selflessly.
              </Text>

              <Text fontSize="md" color="gray.300" lineHeight="1.9" fontStyle="italic">
                At Vision Health Sciences Publishers, we remain steadfast in our dedication to education and the well-being of healthcare professionals, working together for a brighter future in healthcare.
              </Text>
            </MotionBox>

            {/* Right Side - Image Card (slides in from right) */}
            <MotionBox 
              initial={{ opacity: 0, x: 100 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <Box 
                bg="linear-gradient(135deg, rgba(100, 181, 246, 0.15), rgba(255, 140, 0, 0.1))" 
                border="2px solid" 
                borderColor="rgba(255, 140, 0, 0.3)" 
                borderRadius="24px" 
                p={{ base: '16px', md: '24px' }} 
                backdropFilter="blur(10px)"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 140, 0, 0.15)"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, transparent 50%, rgba(100, 181, 246, 0.05) 100%)',
                  borderRadius: '24px',
                  zIndex: 0,
                }}
              >
                {/* Founders Image */}
                <Box 
                  position="relative" 
                  zIndex={1}
                  borderRadius="16px"
                  overflow="hidden"
                  boxShadow="0 10px 30px rgba(0, 0, 0, 0.4)"
                >
                  <img 
                    src="/founderspng.png" 
                    alt="DR. BHARAT PAREEK & MR. ANUBHAV PURI - Founders of Vision Health Sciences Publishers"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                      scale:1.8
                    }}
                  />
                </Box>

                {/* Caption */}
                <Box 
                  textAlign="center" 
                  mt="20px" 
                  position="relative" 
                  zIndex={1}
                >
                  <Text 
                    fontSize={{ base: 'md', md: 'lg' }} 
                    fontWeight="700" 
                    color="#FF8C00"
                    mb="4px"
                  >
                    Founders & Visionaries
                  </Text>
                  <Text fontSize="sm" color="gray.400" fontWeight="600">
                    Vision Health Sciences Publishers
                  </Text>
                </Box>
              </Box>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Mission & Philosophy Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb="60px">
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Core
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                Mission & Philosophy
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="40px">
            <MotionBox variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box fontSize="40px" mb="16px">
                  🎯
                </Box>
                <Text fontSize="24px" fontWeight="800" color="white" mb="16px">
                  Our Mission
                </Text>
                <Text fontSize="md" color="gray.300" lineHeight="1.8">
                  We are dedicated to making quality educational resources affordable and accessible to nursing, paramedical, and medical students. Our goal is to provide student-friendly books that enhance learning while reducing financial strain, ensuring that education remains a right, not a privilege.
                </Text>
              </Box>
            </MotionBox>

            <MotionBox variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box fontSize="40px" mb="16px">
                  💡
                </Box>
                <Text fontSize="24px" fontWeight="800" color="white" mb="16px">
                  Publishing Philosophy
                </Text>
                <Text fontSize="md" color="gray.300" lineHeight="1.8">
                  The Company is aimed to publishing students friendly and curriculum-based books for different subjects in the field of Nursing and allied health sciences.

                  The Company is committed to developing an integrated teaching learning materials to meet the academic requirements of the undergraduate and postgraduate nursing, pharmacy, BAMS & Allied health sciences students.
                </Text>
              </Box>
            </MotionBox>
          </Grid>
        </Container>
      </Box>


      {/* What We Do Section */}
      <WhatWeDoSection />

      {/* Author Support Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Author Partnership
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="30px">
              How We Support Authors
            </Text>

            <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="24px">
              {[
                'Dedicated author liaison and support team',
                'Professional editing and quality assurance',
                'Expert design and layout services',
                'Marketing and promotional support',
                'Royalty structure designed to reward quality',
                'Global distribution and visibility',
              ].map((item, i) => (
                <MotionBox key={i} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box display="flex" gap="16px">
                    <Box color="#64B5F6" mt="2px" flexShrink={0}>
                      <HiCheckCircle size={24} />
                    </Box>
                    <Text fontSize="md" color="gray.300" lineHeight="1.6">
                      {item}
                    </Text>
                  </Box>
                </MotionBox>
              ))}
            </Grid>
          </MotionBox>
        </Container>
      </Box>

      {/* Values Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Principles
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                Core Values That Guide Us
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="24px">
            {values.map((value, i) => (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="28px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }} height="100%">
                  <Text fontSize="lg" fontWeight="800" color="#FF8C00" mb="12px">
                    {value.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400" lineHeight="1.6">
                    {value.description}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Team Section */}
      <TeamSection />

      {/* Editorial Process Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Quality Assurance
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="40px">
              Our Editorial & Production Process
            </Text>

            <Box display="flex" flexDirection="column" gap="16px">
              {[
                { step: 'Manuscript Submission', desc: 'Initial review and content assessment by editorial team' },
                { step: 'Peer Review', desc: 'Rigorous evaluation by subject matter experts' },
                { step: 'Editing & Revisions', desc: 'Comprehensive editing for clarity, accuracy, and consistency' },
                { step: 'Design & Layout', desc: 'Professional formatting and visual design' },
                { step: 'Proofreading', desc: 'Final quality check for perfection' },
                { step: 'Publication', desc: 'Release across print and digital platforms' },
              ].map((item, i) => (
                <MotionBox key={i} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box display="flex" gap="16px" alignItems="flex-start">
                    <Box width="32px" height="32px" borderRadius="50%" bg="linear-gradient(135deg, #64B5F6, #42A5F5)" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="700" flexShrink={0}>
                      {i + 1}
                    </Box>
                    <Box>
                      <Text fontSize="md" fontWeight="700" color="white" mb="4px">
                        {item.step}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {item.desc}
                      </Text>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Differentiators Section */}
      <DifferentiatorSection />

      {/* CTA Section */}
      <CTASection />
    </Box>
  );
}
