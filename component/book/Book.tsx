'use client';

import { Box, Container, Text, Badge, Grid } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiStar, HiHeart } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface ApiBook {
  id: number;
  name: string;
  author: string;
  isbn: string;
  edition: string;
  description: string;
  image_url: string;
  actual_price: number;
  offer_price: number;
  stock_quantity: number;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  category: string;
  courseMappings?: CourseMapping[];
}

interface CourseMapping {
  id: number;
  book_id: number;
  course_id: number;
  semester_id: number;
  is_required: boolean;
  is_recommended: boolean;
}

interface Course {
  id: number;
  name: string;
  description?: string;
}

interface BookSlider {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export default function Book() {
  const router = useRouter();
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [bannerSlides, setBannerSlides] = useState<(BookSlider & { gradient: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const programs = [
    { id: 1, label: 'B.Sc Nursing', color: '#64B5F6' },
    { id: 2, label: 'G.N.M', color: '#FF8C00' },
    { id: 3, label: 'Post-Basic B.Sc', color: '#90CAF9' },
  ] as const;

  // Hardcoded gradients for banner slides
  const gradients = [
    'linear(135deg, #0f172a 0%, #1e293b 100%)',
    'linear(135deg, #1a2a4a 0%, #2d4a6e 100%)',
    'linear(135deg, #0f172a 0%, #1a3a52 100%)',
    'linear(135deg, #1a2a3a 0%, #2d3f4e 100%)',
    'linear(135deg, #0f1820 0%, #1a2f3a 100%)',
  ];

  // Fetch books, courses, and banner sliders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch banner sliders
        const slidersRes = await fetch('/api/book/slider?active=true');
        const slidersData = await slidersRes.json();
        if (slidersData.success && slidersData.data.length > 0) {
          // Map sliders with hardcoded gradients
          const slidersWithGradients = slidersData.data.map((slider: BookSlider, index: number) => ({
            ...slider,
            image_url: slider.image_url,
            gradient: gradients[index % gradients.length],
          }));
          setBannerSlides(slidersWithGradients);
        }

        // Fetch courses
        const coursesRes = await fetch('/api/course');
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          setCourses(coursesData.data || []);
          // Set first course as default
          if (coursesData.data && coursesData.data.length > 0) {
            setSelectedCourseId(coursesData.data[0].id);
          }
        }

        // Fetch books with course mappings
        const booksRes = await fetch('/api/book?includeMappings=true');
        const booksData = await booksRes.json();
        if (booksData.success) {
          setBooks(booksData.data || []);
          // Extract course mappings
          const allMappings: CourseMapping[] = [];
          booksData.data?.forEach((book: ApiBook) => {
            if (book.courseMappings) {
              allMappings.push(...book.courseMappings);
            }
          });
          setCourseMappings(allMappings);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooks = useMemo(() => {
    if (!selectedCourseId || !courseMappings.length) {
      return books;
    }

    // Get book IDs mapped to the selected course
    const bookIds = courseMappings
      .filter((mapping) => mapping.course_id === selectedCourseId)
      .map((mapping) => mapping.book_id);

    // Filter books by the mapped IDs
    return books.filter((book) => bookIds.includes(book.id));
  }, [books, courseMappings, selectedCourseId]);

  const handleBookClick = (bookId: number) => {
    router.push(`/books/store/${bookId}`);
  };

  const toggleWishlist = (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, bannerSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

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

  const navigationButtonStyle = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer' as const,
    zIndex: 10,
    fontSize: '20px',
  };

  const dotStyle = {
    height: '10px',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer' as const,
    transition: 'all 0.3s ease',
  };

  const courseButtonStyle = {
    padding: '12px 28px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer' as const,
    transition: 'all 0.3s ease',
  };

  const wishlistButtonStyle = {
    position: 'absolute' as const,
    bottom: '12px',
    right: '12px',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer' as const,
    zIndex: 5,
  };

  const calculateDiscount = (actualPrice: number, offerPrice: number) => {
    if (actualPrice <= 0) return 0;
    return Math.round(((actualPrice - offerPrice) / actualPrice) * 100);
  };

  if (error) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }}>
        <Container maxW="1400px" textAlign="center">
          <Text fontSize="18px" color="red.400" fontWeight="bold">
            {error}
          </Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
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
        {/* Banner Carousel */}
        {bannerSlides.length > 0 ? (
        <Box
          position="relative"
          mb={{ base: '40px', md: '60px' }}
          borderRadius="16px"
          overflow="hidden"
          height={{ base: '300px', md: '400px', lg: '500px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                position: 'absolute',
                inset: 0,
              }}
            >
              <Box
                position="absolute"
                inset="0"
                backgroundImage={`url(${bannerSlides[currentSlide]?.image_url})`}
                backgroundSize="cover"
                backgroundPosition="center"
                opacity={0.6}
              />
              <Box position="absolute" inset="0" bg={bannerSlides[currentSlide]?.gradient} opacity={0.7} />
              <Box
                position="absolute"
                inset="0"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                p={{ base: '20px', md: '40px' }}
              >
                {['subtitle', 'title', 'description'].map((field, delayIndex) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + delayIndex * 0.2 }}
                    style={field === 'title' ? { marginBottom: '16px' } : field === 'description' ? { maxWidth: '600px' } : {}}
                  >
                    {field === 'subtitle' && (
                      <Box
                        display="inline-block"
                        bg="rgba(255, 140, 0, 0.1)"
                        border="2px solid"
                        borderColor="rgba(255, 140, 0, 0.5)"
                        px="16px"
                        py="8px"
                        borderRadius="50px"
                        mb="16px"
                      >
                        <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                          {bannerSlides[currentSlide].subtitle}
                        </Text>
                      </Box>
                    )}
                    {field === 'title' && (
                      <Text fontSize={{ base: '28px', md: '40px', lg: '56px' }} fontWeight="900" lineHeight="1.2" color="white">
                        {bannerSlides[currentSlide].title}
                      </Text>
                    )}
                    {field === 'description' && (
                      <Text fontSize={{ base: '14px', md: '16px' }} color="gray.200" lineHeight="1.6">
                        {bannerSlides[currentSlide].description}
                      </Text>
                    )}
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            style={{ ...navigationButtonStyle, left: '20px' }}
          >
            &#10094;
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            style={{ ...navigationButtonStyle, right: '20px' }}
          >
            &#10095;
          </motion.button>

          {/* Dots Indicator */}
          <Box
            position="absolute"
            bottom="20px"
            left="50%"
            transform="translateX(-50%)"
            display="flex"
            gap="8px"
            zIndex={10}
          >
            {bannerSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...dotStyle,
                  width: currentSlide === index ? '28px' : '10px',
                  background: currentSlide === index ? '#FF8C00' : 'rgba(255, 255, 255, 0.4)',
                }}
              />
            ))}
          </Box>
        </Box>
        ) : (
          <Box
            position="relative"
            mb={{ base: '40px', md: '60px' }}
            borderRadius="16px"
            overflow="hidden"
            height={{ base: '300px', md: '400px', lg: '500px' }}
            bg="rgba(100, 181, 246, 0.1)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.400" fontSize="18px" fontWeight="700">
              Loading banner...
            </Text>
          </Box>
        )}

        {/* Course Category Buttons */}
        <Box display="flex" gap={{ base: '12px', md: '16px' }} mb={{ base: '40px', md: '60px' }} justifyContent="center" flexWrap="wrap">
          {courses.map((course) => {
            const isSelected = selectedCourseId === course.id;
            return (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCourseId(course.id)}
                style={{
                  ...courseButtonStyle,
                  border: `2px solid ${isSelected ? '#64B5F6' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: isSelected ? 'rgba(100, 181, 246, 0.1)' : 'transparent',
                  color: isSelected ? '#64B5F6' : 'white',
                }}
              >
                {course.name}
              </motion.button>
            );
          })}
        </Box>

        {/* Books Grid */}
        <Box mb={{ base: '60px', md: '80px' }}>
          {/* Results Info */}
          <MotionBox variants={itemVariants} initial="hidden" animate="visible" mb="24px">
            <Text fontSize="15px" color="gray.300" fontWeight="500">
              Showing <strong>{isLoading ? 0 : filteredBooks.length}</strong> books in{' '}
              <strong>{courses.find((c) => c.id === selectedCourseId)?.name || 'Selected Course'}</strong>
            </Text>
          </MotionBox>

          {/* Books Grid */}
          {isLoading ? (
            <MotionBox
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              textAlign="center"
              py="60px"
              bg="rgba(30, 41, 59, 0.4)"
              borderRadius="16px"
              border="1px solid rgba(100, 181, 246, 0.2)"
            >
              <Text fontSize="18px" fontWeight="700" color="white">
                Loading books...
              </Text>
            </MotionBox>
          ) : filteredBooks.length > 0 ? (
            <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '20px', md: '24px' }}>
              {filteredBooks.map((book) => (
                <MotionBox
                  key={book.id}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover="hover"
                  onClick={() => handleBookClick(book.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Box
                    bg="rgba(30, 41, 59, 0.6)"
                    border="1px solid"
                    borderColor="rgba(100, 181, 246, 0.2)"
                    borderRadius="16px"
                    overflow="hidden"
                    backdropFilter="blur(10px)"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: 'rgba(100, 181, 246, 0.4)',
                    }}
                  >
                    {/* Book Image Container */}
                    <Box position="relative" width="100%" height="280px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                      <img
                        src={book.image_url || 'https://via.placeholder.com/500x700?text=No+Image'}
                        alt={book.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />

                      {/* Discount Badge */}
                      {calculateDiscount(book.actual_price, book.offer_price) > 0 && (
                        <Badge position="absolute" top="12px" right="12px" bg="linear-gradient(135deg, #FF8C00, #FFA500)" color="white" px="12px" py="6px" borderRadius="8px" fontWeight="700" fontSize="12px">
                          -{calculateDiscount(book.actual_price, book.offer_price)}%
                        </Badge>
                      )}

                      {/* Stock Status */}
                      {!book.in_stock && (
                        <Box position="absolute" inset="0" bg="rgba(0, 0, 0, 0.6)" display="flex" alignItems="center" justifyContent="center">
                          <Text color="white" fontWeight="700" fontSize="16px">
                            Out of Stock
                          </Text>
                        </Box>
                      )}

                      {/* Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => toggleWishlist(e, book.id)}
                        style={{
                          ...wishlistButtonStyle,
                          background: wishlist.includes(book.id) ? 'rgba(255, 140, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          border: wishlist.includes(book.id) ? '2px solid #FF8C00' : '2px solid rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <HiHeart size={20} color={wishlist.includes(book.id) ? '#FF8C00' : 'white'} fill={wishlist.includes(book.id) ? '#FF8C00' : 'none'} />
                      </motion.button>
                    </Box>

                    {/* Book Details */}
                    <Box p={{ base: '16px', md: '20px' }} flex="1" display="flex" flexDirection="column">
                      {/* Category & Rating */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb="8px">
                        <Text fontSize="xs" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
                          {book.category}
                        </Text>
                        <Box display="flex" alignItems="center" gap="4px">
                          <HiStar size={14} color="#FF8C00" fill="#FF8C00" />
                          <Text fontSize="xs" color="gray.300" fontWeight="600">
                            {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
                          </Text>
                        </Box>
                      </Box>

                      {/* Book Name */}
                      <Text fontSize={{ base: '15px', md: '16px' }} fontWeight="800" color="white" lineHeight="1.4" mb="8px">
                        {book.name && book.name.length > 50 ? `${book.name.substring(0, 50)}...` : book.name}
                      </Text>

                      {/* Author */}
                      <Text fontSize="sm" color="gray.400" mb="8px">
                        by <strong>{book.author && book.author.length > 30 ? `${book.author.substring(0, 30)}...` : book.author}</strong>
                      </Text>

                      {/* ISBN & Edition */}
                      <Box fontSize="xs" color="gray.500" mb="12px" display="flex" flexDirection="column" gap="2px">
                        <Text>ISBN: {book.isbn}</Text>
                        <Text>{book.edition}</Text>
                      </Box>

                      {/* Description */}
                      <Text fontSize="sm" color="gray.300" lineHeight="1.5" mb="12px" flex="1">
                        {book.description && book.description.length > 100 ? `${book.description.substring(0, 100)}...` : book.description || 'No description available'}
                      </Text>

                      {/* Price Section */}
                      <Box>
                        <Box display="flex" alignItems="center" gap="8px" mb="4px">
                          <Text fontSize="18px" fontWeight="900" color="#FF8C00">
                            ₹{book.offer_price}
                          </Text>
                          <Text fontSize="14px" color="gray.500" textDecoration="line-through">
                            ₹{book.actual_price}
                          </Text>
                        </Box>
                        <Text fontSize="xs" color="gray.400">
                          {book.reviews_count} reviews
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Grid>
          ) : (
            <MotionBox
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              textAlign="center"
              py="60px"
              bg="rgba(30, 41, 59, 0.4)"
              borderRadius="16px"
              border="1px solid rgba(100, 181, 246, 0.2)"
            >
              <Text fontSize="18px" fontWeight="700" color="white" mb="8px">
                No books found
              </Text>
              <Text fontSize="14px" color="gray.300">
                Try selecting a different course
              </Text>
            </MotionBox>
          )}
        </Box>
      </Container>
    </Box>
  );
}
