'use client';

import { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const MotionBox = motion.create(Box);

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
  { label: 'Join As Author', href: '/join-as-author' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const navVariants = {
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
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const drawerVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const drawerItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        borderBottom="2px solid"
        borderColor="rgba(100, 181, 246, 0.3)"
        backdropFilter="blur(10px)"
        position="sticky"
        top="0"
        zIndex="100"
        boxShadow="0 8px 32px rgba(100, 181, 246, 0.1)"
      >
        <Container maxW="full" px={{ base: '16px', md: '32px' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={{ base: '16px', md: '24px' }}
            minH="80px"
          >
            {/* Logo */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box
                fontSize={{ base: '20px', md: '24px' }}
                fontWeight="800"
                bgGradient="linear(to-r, #64B5F6, #90CAF9, #BBDEFB)"
                bgClip="text"
                cursor="pointer"
                display="flex"
                alignItems="center"
                gap="8px"
              >
                <Box
                  w="40px"
                  h="40px"
                  bgGradient="linear(to-br, #64B5F6, #42A5F5)"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="18px"
                  fontWeight="bold"
                  color="white"
                >
                  VP
                </Box>
                <Box display={{ base: 'none', sm: 'block' }}>
                  VISIONPUBLICATIONS
                </Box>
              </Box>
            </motion.div>

            {/* Desktop Navigation */}
            <Box
              as="nav"
              display={{ base: 'none', md: 'flex' }}
              gap="4px"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    position="relative"
                    color="white"
                    fontSize="md"
                    fontWeight="500"
                    cursor="pointer"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      bgGradient: 'linear(to-r, #64B5F6, #42A5F5)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease',
                    }}
                    _hover={{
                      _before: {
                        transform: 'scaleX(1)',
                        transformOrigin: 'left',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                </motion.a>
              ))}
            </Box>

            {/* Mobile Menu Button */}
            <Box
              display={{ base: 'flex', md: 'none' }}
              as="button"
              onClick={() => setIsOpen(!isOpen)}
              bg="transparent"
              border="none"
              cursor="pointer"
              p="8px"
              color="white"
              _hover={{ bg: 'rgba(100, 181, 246, 0.1)' }}
              borderRadius="md"
            >
              {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
            </Box>
          </Box>
        </Container>
      </MotionBox>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: '80px',
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 40,
              }}
            />

            {/* Drawer */}
            <MotionBox
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              position="fixed"
              top="80px"
              left="0"
              width="100%"
              maxW="300px"
              bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
              borderRight="2px solid rgba(100, 181, 246, 0.3)"
              zIndex="50"
              height="calc(100vh - 80px)"
              overflowY="auto"
              py="16px"
              px="16px"
            >
              <Box display="flex" flexDirection="column" gap="8px">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    custom={index}
                    variants={drawerItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <Box
                      color="white"
                      fontSize="lg"
                      fontWeight="600"
                      cursor="pointer"
                      _hover={{
                        bgGradient: 'linear(to-r, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.1))',
                        pl: '16px',
                        color: '#64B5F6',
                      }}
                      transition="all 0.3s ease"
                    >
                      {item.label}
                    </Box>
                  </motion.a>
                ))}
                
              </Box>
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
