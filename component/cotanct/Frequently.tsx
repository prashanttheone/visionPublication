'use client';

import { useState } from 'react';
import { Box, Container, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

const MotionBox = motion.create(Box);

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Why should I choose Vision Health Sciences for my academic and professional book needs?',
    answer:
      'Vision Health Sciences offers high-quality, peer-reviewed publications, providing the latest and most accurate information in health sciences, ensuring you stay ahead in your field. Our commitment to excellence and continuous improvement makes us the trusted choice for educators and professionals.',
  },
  {
    id: 2,
    question: "What makes Vision Health Sciences' books stand out from other publishers?",
    answer:
      'Our books are written and reviewed by leading experts in the health sciences industry, ensuring credibility and a practical approach to learning and research. We focus on delivering content that meets the highest academic standards while remaining accessible to learners at all levels.',
  },
  {
    id: 3,
    question: 'Are the books from Vision Health Sciences up to date with the latest medical research?',
    answer:
      'Yes, we regularly update our publications to reflect the latest developments in medical research and healthcare practices. Our editorial team works continuously to ensure all content remains current and evidence-based.',
  },
  {
    id: 4,
    question: 'Do you offer digital versions of your textbooks?',
    answer:
      'We provide both print and digital formats to cater to different learning preferences. Our digital versions are accessible across multiple devices, making learning flexible and convenient for modern students.',
  },
  {
    id: 5,
    question: 'How can educators request examination or desk copies of your books?',
    answer:
      'Educators can request examination copies through our website or by contacting our sales team directly. We provide complimentary copies to qualified instructors for course adoption.',
  },
  {
    id: 6,
    question: 'What support do you provide for instructors using your textbooks?',
    answer:
      'We offer comprehensive instructor resources including presentation slides, test banks, solutions manuals, and supplementary materials. Our team is available to support effective implementation of our textbooks in your courses.',
  },
];

export default function Frequently() {
  const [expanded, setExpanded] = useState<number | null>(0);

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
      transition: { duration: 0.5 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
    },
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

      <Container maxW="1000px" px={{ base: '20px', md: '40px' }}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          textAlign="center"
          mb={{ base: '50px', md: '70px' }}
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
              mb="20px"
            >
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                Frequently Asked Questions
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
              Got Questions?
            </Text>
            <Text
              fontSize={{ base: '42px', md: '56px', lg: '64px' }}
              fontWeight="900"
              lineHeight="1.2"
              bgGradient="linear(to-r, #64B5F6, #90CAF9)"
              bgClip="text"
            >
              We've Got Answers!
            </Text>
          </MotionBox>

          {/* Description */}
          <MotionBox variants={itemVariants} mt="30px" maxW="700px" mx="auto">
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.6">
              Find answers to common questions about our publications, services, and educational resources.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* FAQ Accordion */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          display="flex"
          flexDirection="column"
          gap={{ base: '16px', md: '20px' }}
        >
          {faqItems.map((item) => (
            <MotionBox key={item.id} variants={itemVariants}>
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius={{ base: '12px', md: '16px' }}
                overflow="hidden"
                backdropFilter="blur(10px)"
                transition="all 0.3s ease"
                _hover={{
                  borderColor: 'rgba(100, 181, 246, 0.4)',
                  boxShadow: '0 8px 24px rgba(100, 181, 246, 0.1)',
                }}
              >
                {/* Accordion Header */}
                <motion.button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '24px',
                  }}
                  whileHover={{ paddingLeft: '28px' }}
                  transition={{ duration: 0.2 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="16px">
                    <Text
                      fontSize={{ base: '16px', md: '18px' }}
                      fontWeight="700"
                      color="white"
                      lineHeight="1.6"
                      textAlign="left"
                    >
                      {item.question}
                    </Text>

                    {/* Toggle Icon */}
                    <motion.div
                      animate={{ rotate: expanded === item.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        bg="linear-gradient(135deg, #FF8C00, #FFA500)"
                        width="48px"
                        height="48px"
                        borderRadius="12px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        boxShadow="0 4px 12px rgba(255, 140, 0, 0.3)"
                      >
                        <HiChevronDown size={20} />
                      </Box>
                    </motion.div>
                  </Box>
                </motion.button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {expanded === item.id && (
                    <MotionBox
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      overflow="hidden"
                    >
                      <Box
                        px="24px"
                        pb="24px"
                        borderTop="1px solid"
                        borderColor="rgba(100, 181, 246, 0.1)"
                      >
                        <Text
                          fontSize={{ base: '14px', md: '16px' }}
                          color="gray.300"
                          lineHeight="1.8"
                          fontWeight="500"
                        >
                          {item.answer}
                        </Text>
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            </MotionBox>
          ))}
        </MotionBox>

        {/* CTA Section */}
        <MotionBox
          variants={itemVariants}
          mt={{ base: '60px', md: '80px' }}
          textAlign="center"
        >
          <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" mb="20px">
            Still have questions? We're here to help!
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
          >
            Contact Us
          </motion.button>
        </MotionBox>
      </Container>
    </Box>
  );
}
