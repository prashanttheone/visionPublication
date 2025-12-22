'use client';

import { Box, Container, Input, Badge } from '@chakra-ui/react';
import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiXMark, HiUser, HiShoppingCart } from 'react-icons/hi2';
import Footer from '@/component/footer/Footer';

// Create motion components
const MotionBox = motion.create(Box);

interface ShopLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: { courseId: string; semesterId: string }) => void;
  cartCount?: number;
}

// Animation variants
const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, easing: 'easeOut' },
  },
};

export default function ShopLayout({ children, onSearch, onFilterChange, cartCount = 0 }: ShopLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: number; semester_number: number; description: string }[]>([]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/course');
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch semesters when course is selected
  useEffect(() => {
    if (selectedCourse) {
      const fetchSemesters = async () => {
        try {
          const response = await fetch(`/api/course/${selectedCourse}`);
          const data = await response.json();
          if (data.success && data.data.semesters) {
            setSemesters(data.data.semesters);
          }
        } catch (error) {
          console.error('Failed to fetch semesters:', error);
        }
      };
      fetchSemesters();
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedCourse]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ courseId: selectedCourse, semesterId: selectedSemester });
    }
  }, [selectedCourse, selectedSemester, onFilterChange]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
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
            <Box flexShrink={0} w={{ base: 'auto', lg: '200px',  }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a href="/" style={{ display: 'block', marginLeft: '20px' }}>
                  <img
                    src="/logopng.png"
                    alt="Vision Publications Logo"
                    style={{ height: '50px', width: 'auto', objectFit: 'contain', transform: 'scale(4)' }}
                  />
                </a>
              </motion.div>
            </Box>

            {/* Search Bar */}
            <Box
              flex={{ base: '0 0 100%', sm: '1', lg: '0 0 350px' }}
              position="relative"
              ml={{ base: '0', lg: '60px' }}
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

            {/* Filter: Course */}
            <Box
              w={{ base: '100%', sm: 'calc(50% - 6px)', lg: '180px' }}
            >
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.2)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(100, 181, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.2)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ background: '#1e293b', color: 'white' }}>
                  Select Course
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id} style={{ background: '#1e293b', color: 'white' }}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Box>

            {/* Filter: Semester */}
            <Box
              w={{ base: '100%', sm: 'calc(50% - 6px)', lg: '180px' }}
            >
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedCourse || semesters.length === 0}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)',
                  cursor: !selectedCourse || semesters.length === 0 ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  opacity: !selectedCourse || semesters.length === 0 ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedCourse && semesters.length > 0) {
                    e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.2)';
                }}
                onFocus={(e) => {
                  if (selectedCourse && semesters.length > 0) {
                    e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.5)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(100, 181, 246, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 181, 246, 0.2)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ background: '#1e293b', color: 'white' }}>
                  Select Semester
                </option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id} style={{ background: '#1e293b', color: 'white' }}>
                    {semester.description || `Semester ${semester.semester_number}`}
                  </option>
                ))}
              </select>
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

      {/* Footer */}
      <Footer />
    </Box>
  );
}
