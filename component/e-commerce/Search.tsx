'use client';

import { Box, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import { useState } from 'react';

const MotionBox = motion.create(Box);

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
}

export default function Search({ searchQuery, onSearchChange, onSearchClear }: SearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const searchVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <MotionBox
      variants={searchVariants}
      initial="hidden"
      animate="visible"
      mb={{ base: '20px', md: '32px' }}
    >
      <Box position="relative">
        {/* Search Icon */}
        <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)" zIndex={2} color="gray.400">
          <HiMagnifyingGlass size={20} />
        </Box>

        {/* Search Input */}
        <motion.div
          animate={{
            boxShadow: isFocused ? '0 0 0 3px rgba(100, 181, 246, 0.2)' : '0 0 0 0px rgba(100, 181, 246, 0)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Input
            placeholder="Search by book name, author, ISBN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            pl="48px"
            pr={searchQuery ? '48px' : '16px'}
            py="12px"
            fontSize="15px"
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
            onClick={onSearchClear}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              zIndex: 3,
            }}
          >
            <HiXMark size={20} color="#64B5F6" />
          </motion.button>
        )}
      </Box>

      {/* Search Info Text */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#90CAF9',
          }}
        >
          Searching for: <strong>"{searchQuery}"</strong>
        </motion.div>
      )}
    </MotionBox>
  );
}
