'use client';

import { Box, Container, Text, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

const footerLinks = {
  Quick: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
  ],
  Resources: [
    { label: 'E-Resources', href: '/resources' },
    { label: 'Publications', href: '/publications' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function Footer() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <MotionBox
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={itemVariants}
      bg="linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"
      borderTop="2px solid"
      borderColor="rgba(100, 181, 246, 0.3)"
      backdropFilter="blur(10px)"
      boxShadow="0 -8px 32px rgba(100, 181, 246, 0.1)"
      mt="64px"
      pt="48px"
      pb="32px"
    >
      <Container maxW="full" px={{ base: '16px', md: '32px' }}>
        {/* Logo and Description */}
        <MotionBox variants={itemVariants} mb="48px">
          <Box display="flex" gap="16px" mb="16px" alignItems="center" ml="20px">
            <a href="/" style={{ display: 'block', flexShrink: 0 }}>
              <img
                src="/logopng.png"
                alt="Vision Publications Logo"
                style={{ height: '50px', width: 'auto', objectFit: 'contain', scale: 4 }}
              />
            </a>
          </Box>
          <Text color="gray.400" fontSize="sm" maxW="300px" lineHeight="tall">
            Dedicated to publishing quality content and resources that inspire and educate our global community.
          </Text>
        </MotionBox>

        {/* Links Grid */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap="32px"
          py="32px"
          mb="32px"
        >
          {Object.entries(footerLinks).map(([category, links]) => (
            <MotionBox key={category} variants={itemVariants}>
              <Box
                fontSize="md"
                fontWeight="700"
                color="white"
                position="relative"
                pb="8px"
                mb="16px"
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '2px',
                  bgGradient: 'linear(to-r, #64B5F6, #42A5F5)',
                }}
              >
                {category}
              </Box>
              <Box display="flex" flexDirection="column" gap="12px">
                {links.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'block',
                      color: '#9CA3AF',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </Box>
            </MotionBox>
          ))}

          {/* Contact Info */}
          <MotionBox variants={itemVariants}>
            <Box
              fontSize="md"
              fontWeight="700"
              color="white"
              position="relative"
              pb="8px"
              mb="16px"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                bgGradient: 'linear(to-r, #64B5F6, #42A5F5)',
              }}
            >
              Contact
            </Box>
            <Box display="flex" flexDirection="column" gap="12px">
              <Box display="flex" alignItems="center" gap="8px" color="gray.400" fontSize="sm">
                <HiOutlineEnvelope size={16} />
                <Link href="mailto:info@visionpublications.com" _hover={{ textDecoration: 'none' }}>
                  info@visionpublications.com
                </Link>
              </Box>
              <Box display="flex" alignItems="center" gap="8px" color="gray.400" fontSize="sm">
                <HiOutlinePhone size={16} />
                <Link href="tel:+1234567890" _hover={{ textDecoration: 'none' }}>+1 (234) 567-890</Link>
              </Box>
              <Box display="flex" alignItems="center" gap="8px" color="gray.400" fontSize="sm">
                <HiOutlineMapPin size={16} />
                <Text>New York, USA</Text>
              </Box>
            </Box>
          </MotionBox>
        </Box>

        {/* Divider */}
        <Box
          borderTop="1px solid"
          borderColor="rgba(100, 181, 246, 0.2)"
          my="32px"
        />

        {/* Bottom Section */}
        <MotionBox variants={itemVariants}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ base: 'column', md: 'row' }}
            gap="16px"
          >
            <Text color="gray.500" fontSize="xs">
              © 2025 VisionPublications. All rights reserved.
            </Text>
            <Box display="flex" gap="24px">
              {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    color: '#94A3B8',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {social}
                </motion.a>
              ))}
            </Box>
          </Box>
        </MotionBox>
      </Container>
    </MotionBox>
  );
}
