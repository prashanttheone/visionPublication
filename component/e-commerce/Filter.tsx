'use client';

import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi2';
import { useState } from 'react';
import { categories, priceRanges, sortOptions } from '../book/bookData';

const MotionBox = motion.create(Box);

interface FilterProps {
  selectedCategory: string;
  selectedPriceRange: number;
  selectedSort: string;
  onCategoryChange: (category: string) => void;
  onPriceChange: (priceRangeIndex: number) => void;
  onSortChange: (sortValue: string) => void;
}

export default function Filter({
  selectedCategory,
  selectedPriceRange,
  selectedSort,
  onCategoryChange,
  onPriceChange,
  onSortChange,
}: FilterProps) {
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    price: true,
    sort: true,
  });

  const toggleFilter = (filter: keyof typeof expandedFilters) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const filterVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <MotionBox
      variants={filterVariants}
      initial="hidden"
      animate="visible"
      bg="rgba(30, 41, 59, 0.6)"
      border="1px solid"
      borderColor="rgba(100, 181, 246, 0.2)"
      borderRadius="16px"
      p={{ base: '16px', md: '24px' }}
      backdropFilter="blur(10px)"
      height="fit-content"
      position={{ base: 'relative', md: 'sticky' }}
      top={{ md: '100px' }}
    >
      {/* Sort Section */}
      <Box mb="28px">
        <motion.button
          onClick={() => toggleFilter('sort')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Text fontSize="16px" fontWeight="700" color="white">
            Sort By
          </Text>
          <motion.div
            animate={{ rotate: expandedFilters.sort ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiChevronDown size={20} color="#64B5F6" />
          </motion.div>
        </motion.button>

        {expandedFilters.sort && (
          <Box display="flex" flexDirection="column" gap="10px" mt="12px">
            {sortOptions.map((option: any) => (
              <motion.label
                key={option.value}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={selectedSort === option.value}
                  onChange={() => onSortChange(option.value)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#FF8C00',
                  }}
                />
                <Text fontSize="14px" color="gray.300">
                  {option.label}
                </Text>
              </motion.label>
            ))}
          </Box>
        )}
      </Box>

      {/* Category Filter */}
      <Box mb="28px" pb="28px" borderBottom="1px solid rgba(100, 181, 246, 0.1)">
        <motion.button
          onClick={() => toggleFilter('category')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Text fontSize="16px" fontWeight="700" color="white">
            Category
          </Text>
          <motion.div
            animate={{ rotate: expandedFilters.category ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiChevronDown size={20} color="#64B5F6" />
          </motion.div>
        </motion.button>

        {expandedFilters.category && (
          <Box display="flex" flexDirection="column" gap="10px" mt="12px" maxH="400px" overflowY="auto">
            {categories.map((category: string) => (
              <motion.label
                key={category}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#FF8C00',
                  }}
                />
                <Text fontSize="14px" color="gray.300">
                  {category}
                </Text>
              </motion.label>
            ))}
          </Box>
        )}
      </Box>

      {/* Price Range Filter */}
      <Box>
        <motion.button
          onClick={() => toggleFilter('price')}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Text fontSize="16px" fontWeight="700" color="white">
            Price Range
          </Text>
          <motion.div
            animate={{ rotate: expandedFilters.price ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiChevronDown size={20} color="#64B5F6" />
          </motion.div>
        </motion.button>

        {expandedFilters.price && (
          <Box display="flex" flexDirection="column" gap="10px" mt="12px">
            {priceRanges.map((range: any, index: number) => (
              <motion.label
                key={`${range.min}-${range.max}`}
                variants={itemVariants}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="radio"
                  name="price"
                  value={index}
                  checked={selectedPriceRange === index}
                  onChange={() => onPriceChange(index)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#FF8C00',
                  }}
                />
                <Text fontSize="14px" color="gray.300">
                  {range.label}
                </Text>
              </motion.label>
            ))}
          </Box>
        )}
      </Box>
    </MotionBox>
  );
}
