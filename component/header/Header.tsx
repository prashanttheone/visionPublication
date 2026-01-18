'use client';

import { useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const MotionBox = motion.create(Box);

const navItems = [
  // { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Books', href: '/books' },
  { label: 'E-Resources', href: '/resources' },
   { label: 'Join As Author', href: '/join-as-author' },
   { label: 'Event/Vision CSR', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },

];

// PDF Catalog link - replace with your actual Google Drive or PDF link
const CATALOG_PDF_LINK = 'https://drive.google.com/file/d/13fzHOMvpP4K6YP3z99HOekh6vjQphCbZ/view';

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
              style={{ marginLeft: '20px' }}
            >
              <a href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <img
                  src="/logopng.png"
                  alt="Vision Publications Logo"
                  style={{ height: '50px', width: 'auto', objectFit: 'contain', scale:4}}
                />
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <Box
              as="nav"
              display={{ base: 'none', md: 'flex' }}
              gap="4px"
              alignItems="center"
              justifyContent="center"
              flex="1"
              mx="20px"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    padding: '2px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.5), rgba(255, 140, 0, 0.5))',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                    borderRadius="8px"
                    px="14px"
                    py="8px"
                    position="relative"
                    color="white"
                    fontSize="md"
                    fontWeight="500"
                    cursor="pointer"
                    transition="all 0.3s ease"
                    _hover={{
                      bg: 'linear-gradient(135deg, #1e293b 0%, #2d3a4f 100%)',
                    }}
                  >
                    {item.label}
                  </Box>
                </motion.a>
              ))}
            </Box>

            {/* Catalog Button with Glowing Gradient - Right Side */}
            <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '2px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF8C00, #FFA500, #FFD700, #FF8C00)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientGlow 3s ease infinite',
                  boxShadow: '0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
                }}
              >
                <button
                  onClick={() => window.open(CATALOG_PDF_LINK, '_blank')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Catalouge
                </button>
              </motion.div>
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

                {/* Mobile Catalog Button with Glowing Gradient */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginTop: '16px',
                    padding: '2px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF8C00, #FFA500, #FFD700, #FF8C00)',
                    backgroundSize: '300% 300%',
                    animation: 'gradientGlow 3s ease infinite',
                    boxShadow: '0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
                  }}
                >
                  <button
                    onClick={() => {
                      window.open(CATALOG_PDF_LINK, '_blank');
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                    }}
                  >
                    Get Catalouge
                  </button>
                </motion.div>
              </Box>
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
