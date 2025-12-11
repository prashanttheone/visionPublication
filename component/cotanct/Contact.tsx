'use client';

import { Box, Container, Text, Input, Textarea } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin, HiOutlineClock } from 'react-icons/hi2';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';

const MotionBox = motion.create(Box);
const MotionInput = motion.create(Input);
const MotionTextarea = motion.create(Textarea);

export default function Contact() {
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

  const contactCardVariants = {
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

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook', color: '#1877F2' },
    { icon: FaTwitter, href: '#', label: 'Twitter', color: '#1DA1F2' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: '#0A66C2' },
    { icon: FaInstagram, href: '#', label: 'Instagram', color: '#E4405F' },
    { icon: FaYoutube, href: '#', label: 'YouTube', color: '#FF0000' },
  ];

  const contactInfo = [
    {
      icon: HiOutlinePhone,
      label: 'Hotline',
      value: '+91-9646 927 599',
      href: 'tel:+919646927599',
    },
    {
      icon: HiOutlineEnvelope,
      label: 'Email',
      value: 'visionhealthsciencespublisher@gmail.com',
      href: 'mailto:visionhealthsciencespublisher@gmail.com',
    },
    {
      icon: HiOutlineMapPin,
      label: 'Address',
      value: 'F 260, 8B, Phase 1, Industrial Area, Sahibzada Ajit Singh Nagar, Punjab 160055',
      multiline: true,
    },
    {
      icon: HiOutlineClock,
      label: 'Opening Hours',
      hours: [
        { day: 'Mon to Fri', time: '9:00 AM - 6:00 PM' },
        { day: 'Saturday', time: '10:00 AM - 6:30 PM' },
        { day: 'Sunday', time: 'Closed' },
      ],
      multiline: true,
    },
  ];

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
                Get In Touch
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
              Contact Us
            </Text>
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" maxW="600px" mx="auto">
              Have questions? We'd love to hear from you. Get in touch with us and let's start a conversation.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Contact Info Cards */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gap={{ base: '20px', md: '30px' }}
          mb={{ base: '60px', md: '80px' }}
        >
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            const cardContent = (
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius="16px"
                p={{ base: '24px', md: '32px' }}
                backdropFilter="blur(10px)"
                cursor={info.href ? 'pointer' : 'default'}
                transition="all 0.3s ease"
                _hover={{
                  borderColor: 'rgba(100, 181, 246, 0.4)',
                }}
              >
                {/* Icon */}
                <Box
                  width="56px"
                  height="56px"
                  bgGradient="linear(to-br, #64B5F6, #42A5F5)"
                  borderRadius="12px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  mb="16px"
                  boxShadow="0 8px 16px rgba(100, 181, 246, 0.2)"
                >
                  <IconComponent size={28} />
                </Box>

                {/* Label */}
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="#FF8C00"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  mb="8px"
                >
                  {info.label}
                </Text>

                {/* Value or Hours */}
                {info.hours ? (
                  <Box>
                    {info.hours.map((hour, i) => (
                      <Box key={i} mb={i < info.hours.length - 1 ? '8px' : 0}>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {hour.day}
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          {hour.time}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text
                    fontSize={{ base: '14px', md: '16px' }}
                    fontWeight="600"
                    color="white"
                    lineHeight="1.6"
                  >
                    {info.value}
                  </Text>
                )}
              </Box>
            );

            return (
              <MotionBox key={index} variants={itemVariants} whileHover="hover">
                <motion.div variants={contactCardVariants} whileHover="hover">
                  {info.href ? (
                    <a
                      href={info.href}
                      target={info.href?.startsWith('http') ? '_blank' : undefined}
                      rel={info.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ textDecoration: 'none' }}
                    >
                      {cardContent}
                    </a>
                  ) : (
                    cardContent
                  )}
                </motion.div>
              </MotionBox>
            );
          })}
        </Box>

        {/* Contact Form and Social Links */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: '40px', lg: '60px' }}
          mb={{ base: '60px', md: '80px' }}
        >
          {/* Contact Form */}
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <MotionBox variants={itemVariants} mb="20px">
              <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="white" mb="12px">
                Send us a Message
              </Text>
              <Text fontSize="sm" color="gray.300">
                Fill out the form below and we'll get back to you as soon as possible.
              </Text>
            </MotionBox>

            <Box display="flex" flexDirection="column" gap="16px">
              <MotionBox variants={itemVariants}>
                <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                  Full Name
                </Text>
                <Input
                  placeholder="John Doe"
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  color="white"
                  borderRadius="8px"
                  py="12px"
                  px="16px"
                  fontSize="sm"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    outline: 'none',
                    borderColor: 'rgba(100, 181, 246, 0.5)',
                    boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)',
                  }}
                />
              </MotionBox>

              <MotionBox variants={itemVariants}>
                <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                  Email Address
                </Text>
                <Input
                  placeholder="john@example.com"
                  type="email"
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  color="white"
                  borderRadius="8px"
                  py="12px"
                  px="16px"
                  fontSize="sm"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    outline: 'none',
                    borderColor: 'rgba(100, 181, 246, 0.5)',
                    boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)',
                  }}
                />
              </MotionBox>

              <MotionBox variants={itemVariants}>
                <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                  Subject
                </Text>
                <Input
                  placeholder="How can we help?"
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  color="white"
                  borderRadius="8px"
                  py="12px"
                  px="16px"
                  fontSize="sm"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    outline: 'none',
                    borderColor: 'rgba(100, 181, 246, 0.5)',
                    boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)',
                  }}
                />
              </MotionBox>

              <MotionBox variants={itemVariants}>
                <Text fontSize="sm" fontWeight="600" color="gray.300" mb="8px">
                  Message
                </Text>
                <Textarea
                  placeholder="Tell us more about your inquiry..."
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor="rgba(100, 181, 246, 0.2)"
                  color="white"
                  borderRadius="8px"
                  py="12px"
                  px="16px"
                  fontSize="sm"
                  minH="140px"
                  resize="none"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    outline: 'none',
                    borderColor: 'rgba(100, 181, 246, 0.5)',
                    boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)',
                  }}
                />
              </MotionBox>

              <MotionBox variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Send Message
                </motion.button>
              </MotionBox>
            </Box>
          </MotionBox>

          {/* Social Links & Info */}
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <MotionBox variants={itemVariants} mb="40px">
              <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="white" mb="12px">
                Connect With Us
              </Text>
              <Text fontSize="sm" color="gray.300">
                Follow us on social media for updates, news, and insights into health sciences publishing.
              </Text>
            </MotionBox>

            {/* Social Icons */}
            <Box display="flex" gap="16px" mb="50px" flexWrap="wrap">
              {socialLinks.map((social, index) => {
                const SocialIcon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      width="60px"
                      height="60px"
                      bg="rgba(30, 41, 59, 0.6)"
                      border="2px solid"
                      borderColor="rgba(100, 181, 246, 0.2)"
                      borderRadius="12px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      transition="all 0.3s ease"
                      _hover={{
                        borderColor: social.color,
                        bg: `${social.color}20`,
                      }}
                    >
                      <SocialIcon size={28} color={social.color} />
                    </Box>
                  </motion.a>
                );
              })}
            </Box>

            {/* Quick Info */}
            <MotionBox variants={itemVariants}>
              <Box
                bg="rgba(100, 181, 246, 0.1)"
                border="1px solid"
                borderColor="rgba(100, 181, 246, 0.2)"
                borderRadius="12px"
                p="24px"
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="#64B5F6"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  mb="12px"
                >
                  Quick Response
                </Text>
                <Text fontSize="sm" color="gray.300" lineHeight="1.8">
                  We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call
                  our hotline directly.
                </Text>
              </Box>
            </MotionBox>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
}
