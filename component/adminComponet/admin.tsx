'use client';

import { Box, Container, Text, Grid, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiMiniEye, HiMiniNewspaper, HiMiniAcademicCap, HiMiniPlayCircle, HiMiniQuestionMarkCircle } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface AdminStats {
  totalBooks: number;
  totalCourses: number;
  totalBlogs: number;
  totalSliders: number;
  totalYoutubeVideos: number;
}

const adminSections = [
  {
    id: 'books',
    title: 'Books Management',
    description: 'Manage book inventory, pricing, and details',
    icon: HiMiniEye,
    route: '/admin/books',
    color: '#64B5F6',
    bgGradient: 'linear(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(66, 165, 245, 0.1) 100%)',
    subsections: [
      { label: 'All Books', route: '/admin/books' },
      { label: 'Book Sliders', route: '/admin/books/slider' },
    ],
  },
  {
    id: 'courses',
    title: 'Courses Management',
    description: 'Manage courses, semesters, and curriculum',
    icon: HiMiniAcademicCap,
    route: '/admin/course',
    color: '#90CAF9',
    bgGradient: 'linear(135deg, rgba(144, 202, 249, 0.2) 0%, rgba(100, 181, 246, 0.1) 100%)',
    subsections: [
      { label: 'All Courses', route: '/admin/course' },
    ],
  },
  {
    id: 'blogs',
    title: 'Blogs Management',
    description: 'Create and manage blog posts',
    icon: HiMiniNewspaper,
    route: '/admin/blogs',
    color: '#4CAF50',
    bgGradient: 'linear(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(102, 187, 106, 0.1) 100%)',
    subsections: [
      { label: 'All Blogs', route: '/admin/blogs' },
    ],
  },
  {
    id: 'videos',
    title: 'YouTube Videos',
    description: 'Manage educational video content',
    icon: HiMiniPlayCircle,
    route: '/admin/youtube',
    color: '#FF8C00',
    bgGradient: 'linear(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%)',
    subsections: [
      { label: 'All Videos', route: '/admin/youtube' },
    ],
  },
  {
    id: 'enquiries',
    title: 'Enquiry Forms',
    description: 'Manage user enquiries and submissions',
    icon: HiMiniQuestionMarkCircle,
    route: '/admin/enquiryforms',
    color: '#9C27B0',
    bgGradient: 'linear(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(171, 71, 188, 0.1) 100%)',
    subsections: [
      { label: 'All Enquiries', route: '/admin/enquiryforms' },
    ],
  },
];

export default function AdminHome() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalBooks: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalSliders: 0,
    totalYoutubeVideos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch books count
        const booksRes = await fetch('/api/book');
        const booksData = await booksRes.json();

        // Fetch courses count
        const coursesRes = await fetch('/api/course');
        const coursesData = await coursesRes.json();

        // Fetch sliders count
        const slidersRes = await fetch('/api/book/slider');
        const slidersData = await slidersRes.json();

        // Fetch youtube videos count
        const videosRes = await fetch('/api/youtube');
        const videosData = await videosRes.json();

        setStats({
          totalBooks: booksData.count || 0,
          totalCourses: coursesData.count || 0,
          totalBlogs: 0, // Add blog count endpoint if needed
          totalSliders: slidersData.count || 0,
          totalYoutubeVideos: videosData.count || 0,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(100, 181, 246, 0.25)',
      transition: { duration: 0.3 },
    },
  };

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
      {/* Background Elements */}
      <Box
        position="fixed"
        top="-100px"
        right="-100px"
        width="400px"
        height="400px"
        borderRadius="50%"
        bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)"
        filter="blur(40px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="fixed"
        bottom="-50px"
        left="-50px"
        width="300px"
        height="300px"
        borderRadius="50%"
        bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)"
        filter="blur(40px)"
        pointerEvents="none"
        zIndex={0}
      />

      <Container maxW="1400px" px={{ base: '16px', md: '32px' }} position="relative" zIndex={1}>
        {/* Header */}
        <MotionBox variants={itemVariants} initial="hidden" animate="visible" mb="60px">
          <Text fontSize={{ base: '36px', md: '48px' }} fontWeight="900" color="white" mb="12px">
            Admin Dashboard
          </Text>
          <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300">
            Manage all content and resources from one central location
          </Text>
        </MotionBox>

        {/* Error Message */}
        {error && (
          <Box bg="red.900" color="red.100" p="16px" borderRadius="8px" mb="40px">
            <Text>{error}</Text>
          </Box>
        )}

        {/* Statistics Cards */}
        <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={{ base: '16px', md: '20px' }} mb="60px">
          {[
            { label: 'Total Books', value: stats.totalBooks, color: '#64B5F6' },
            { label: 'Total Courses', value: stats.totalCourses, color: '#90CAF9' },
            { label: 'Book Sliders', value: stats.totalSliders, color: '#4CAF50' },
            { label: 'YouTube Videos', value: stats.totalYoutubeVideos, color: '#FF8C00' },
            { label: 'Total Blogs', value: stats.totalBlogs, color: '#9C27B0' },
          ].map((stat, index) => (
            <MotionBox key={index} variants={cardVariants} initial="hidden" animate="visible">
              <Box
                bg="rgba(30, 41, 59, 0.6)"
                border="1px solid rgba(100, 181, 246, 0.2)"
                borderRadius="12px"
                p="24px"
                textAlign="center"
                backdropFilter="blur(10px)"
                transition="all 0.3s ease"
                _hover={{
                  borderColor: 'rgba(100, 181, 246, 0.4)',
                  boxShadow: `0 10px 30px ${stat.color}20`,
                }}
              >
                <Text fontSize="36px" fontWeight="900" color={stat.color} mb="8px">
                  {isLoading ? '-' : stat.value}
                </Text>
                <Text fontSize="14px" fontWeight="600" color="gray.300">
                  {stat.label}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Grid>

        {/* Admin Sections */}
        <Text fontSize="24px" fontWeight="900" color="white" mb="32px">
          Management Sections
        </Text>

        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '24px', md: '28px' }}>
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <MotionBox key={section.id} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box
                  bg={section.bgGradient}
                  border="1px solid rgba(100, 181, 246, 0.2)"
                  borderRadius="16px"
                  p={{ base: '24px', md: '32px' }}
                  backdropFilter="blur(10px)"
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: section.color,
                    boxShadow: `0 20px 40px ${section.color}25`,
                  }}
                >
                  {/* Icon */}
                  <Box mb="16px" color={section.color}>
                    <IconComponent size={40} />
                  </Box>

                  {/* Title & Description */}
                  <Text fontSize="20px" fontWeight="800" color="white" mb="8px">
                    {section.title}
                  </Text>
                  <Text fontSize="14px" color="gray.300" mb="24px" flex="1">
                    {section.description}
                  </Text>

                  {/* Subsections */}
                  <Box mb="24px">
                    {section.subsections.map((subsection, idx) => (
                      <Box key={idx} mb="8px">
                        <Button
                          onClick={() => handleNavigate(subsection.route)}
                          width="100%"
                          bg="transparent"
                          color={section.color}
                          fontSize="13px"
                          fontWeight="600"
                          px="12px"
                          py="8px"
                          borderRadius="6px"
                          border={`1px solid ${section.color}40`}
                          cursor="pointer"
                          transition="all 0.3s ease"
                          _hover={{
                            bg: `${section.color}15`,
                            borderColor: section.color,
                          }}
                        >
                          → {subsection.label}
                        </Button>
                      </Box>
                    ))}
                  </Box>

                  {/* Main Button */}
                  <Button
                    onClick={() => handleNavigate(section.route)}
                    width="100%"
                    bg={`linear-gradient(135deg, ${section.color}, ${section.color}cc)`}
                    color="white"
                    fontWeight="700"
                    py="12px"
                    borderRadius="8px"
                    border="none"
                    cursor="pointer"
                    transition="all 0.3s ease"
                    _hover={{
                      opacity: 0.9,
                    }}
                  >
                    Manage {section.title.split(' ')[0]}
                  </Button>
                </Box>
              </MotionBox>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
