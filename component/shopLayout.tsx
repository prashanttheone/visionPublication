'use client';

import { Box, Container, Input, Button, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiMagnifyingGlass, HiShoppingCart, HiUser, HiXMark } from 'react-icons/hi2';
import { ReactNode } from 'react';

const MotionBox = motion.create(Box);

interface ShopLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  cartCount?: number;
}

export default function ShopLayout({ children, onSearch, cartCount = 0 }: ShopLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" display="flex" flexDirection="column">
      {/* Shop Navbar */}
      <MotionBox
        variants={navVariants}
        initial="hidden"
        animate="visible"
        bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        borderBottom="2px solid"
        borderColor="rgba(100, 181, 246, 0.3)"
        backdropFilter="blur(10px)"
        position="sticky"
        top="0"
        zIndex="50"
        boxShadow="0 8px 32px rgba(100, 181, 246, 0.1)"
      >
        <Container maxW="full" px={{ base: '16px', md: '32px' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py={{ base: '12px', md: '16px' }}
            minH="70px"
            gap={{ base: '12px', md: '24px' }}
            flexWrap={{ base: 'wrap', lg: 'nowrap' }}
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box
                fontSize={{ base: '16px', md: '20px' }}
                fontWeight="800"
                bgGradient="linear(to-r, #64B5F6, #90CAF9, #BBDEFB)"
                bgClip="text"
                cursor="pointer"
                display="flex"
                alignItems="center"
                gap="8px"
                whiteSpace="nowrap"
              >
                <Box
                  w={{ base: '32px', md: '40px' }}
                  h={{ base: '32px', md: '40px' }}
                  bgGradient="linear(to-br, #64B5F6, #42A5F5)"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={{ base: '14px', md: '18px' }}
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

            {/* Search Bar */}
            <Box
              flex={{ base: '0 0 100%', sm: '1', lg: '0 0 350px' }}
              position="relative"
            >
              <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" zIndex={2} color="gray.400">
                <HiMagnifyingGlass size={18} />
              </Box>

              <motion.div
                animate={{
                  boxShadow: isFocused ? '0 0 0 3px rgba(100, 181, 246, 0.2)' : '0 0 0 0px rgba(100, 181, 246, 0)',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  pl="40px"
                  pr={searchQuery ? '40px' : '12px'}
                  py="10px"
                  fontSize={{ base: '13px', md: '14px' }}
                  fontWeight="500"
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid"
                  borderColor={isFocused ? 'rgba(100, 181, 246, 0.5)' : 'rgba(100, 181, 246, 0.2)'}
                  color="white"
                  _placeholder={{
                    color: 'gray.400',
                  }}
                  _focus={{
                    outline: 'none',
                    borderColor: 'rgba(100, 181, 246, 0.5)',
                    bg: 'rgba(30, 41, 59, 0.8)',
                  }}
                  _hover={{
                    borderColor: 'rgba(100, 181, 246, 0.3)',
                  }}
                  backdropFilter="blur(10px)"
                  transition="all 0.2s ease"
                />
              </motion.div>

              {/* Clear Button */}
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    zIndex: 3,
                  }}
                >
                  <HiXMark size={18} color="#64B5F6" />
                </motion.button>
              )}
            </Box>

            {/* Right Actions */}
            <Box
              display="flex"
              alignItems="center"
              gap={{ base: '8px', md: '16px' }}
              ml={{ base: '0', lg: 'auto' }}
              order={{ base: 3, lg: 'unset' }}
              w={{ base: '100%', sm: 'auto' }}
              justifyContent={{ base: 'space-between', sm: 'flex-end' }}
            >
              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  background: 'transparent',
                  color: '#64B5F6',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.3)';
                }}
              >
                <HiUser size={18} />
                <Box display={{ base: 'none', sm: 'block' }}>Login</Box>
              </motion.button>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 140, 0, 0.3)',
                  background: 'rgba(255, 140, 0, 0.05)',
                  color: '#FF8C00',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 140, 0, 0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 140, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 140, 0, 0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 140, 0, 0.3)';
                }}
              >
                <HiShoppingCart size={18} />
                {cartCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-6px"
                    right="-6px"
                    bg="linear-gradient(135deg, #FF8C00, #FFA500)"
                    color="white"
                    borderRadius="full"
                    fontSize="10px"
                    fontWeight="700"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
                <Box display={{ base: 'none', sm: 'block' }} ml="4px">
                  Cart
                </Box>
              </motion.button>
            </Box>
          </Box>
        </Container>
      </MotionBox>

      {/* Main Content */}
      <Box flex="1" py={{ base: '20px', md: '40px' }}>
        {children}
      </Box>

      {/* Footer will be added by main layout */}
    </Box>
  );
}
