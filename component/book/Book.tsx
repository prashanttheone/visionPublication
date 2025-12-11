'use client';

import { Box, Container, Text, Badge, Grid } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiStar, HiHeart } from 'react-icons/hi2';
import type { Book } from './bookData';
import { booksData } from './bookData';

const MotionBox = motion.create(Box);

export default function Book() {
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState<'BSc' | 'GNM' | 'Post-Basic'>('BSc');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const programs = [
    { id: 'BSc', label: 'B.Sc Nursing', color: '#64B5F6' },
    { id: 'GNM', label: 'G.N.M', color: '#FF8C00' },
    { id: 'Post-Basic', label: 'Post-Basic B.Sc', color: '#90CAF9' },
  ] as const;

  const bannerSlides = [
    {
      id: 1,
      title: 'Healthcare Books Collection',
      subtitle: 'Discover Medical Excellence',
      description: 'Explore our comprehensive range of nursing, medical, and healthcare textbooks curated by expert authors.',
      image: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=1200&h=500&fit=crop',
      gradient: 'linear(135deg, #0f172a 0%, #1e293b 100%)',
    },
    {
      id: 2,
      title: 'Expert-Curated Content',
      subtitle: 'Quality Education Resources',
      description: 'Access peer-reviewed publications written by leading healthcare professionals and educators.',
      image: 'https://images.unsplash.com/photo-150784272343-583f20270319?w=1200&h=500&fit=crop',
      gradient: 'linear(135deg, #1a2a4a 0%, #2d4a6e 100%)',
    },
    {
      id: 3,
      title: 'Latest Medical Insights',
      subtitle: 'Stay Updated with Research',
      description: 'Get the latest information on medical advancements and healthcare best practices.',
      image: 'https://images.unsplash.com/photo-1576091160550-112173faf246?w=1200&h=500&fit=crop',
      gradient: 'linear(135deg, #0f172a 0%, #1a3a52 100%)',
    },
  ];

  const filteredBooks = useMemo(() => {
    return booksData.filter((book) => book.program === selectedProgram);
  }, [selectedProgram]);

  const handleBookClick = (bookId: number) => {
    router.push(`/books/store/${bookId}`);
  };

  const toggleWishlist = (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    setWishlist((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
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

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1400px" px={{ base: '16px', md: '32px' }} position="relative" zIndex={1}>
        {/* Banner Carousel */}
        <Box position="relative" mb={{ base: '40px', md: '60px' }} borderRadius="16px" overflow="hidden" height={{ base: '300px', md: '400px', lg: '500px' }}>
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
                backgroundImage={`url(${bannerSlides[currentSlide].image})`}
                backgroundSize="cover"
                backgroundPosition="center"
                opacity={0.6}
              />
              <Box
                position="absolute"
                inset="0"
                bg={bannerSlides[currentSlide].gradient}
                opacity={0.7}
              />
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px" mb="16px">
                    <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                      {bannerSlides[currentSlide].subtitle}
                    </Text>
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  style={{ marginBottom: '16px' }}
                >
                  <Text fontSize={{ base: '28px', md: '40px', lg: '56px' }} fontWeight="900" lineHeight="1.2" color="white">
                    {bannerSlides[currentSlide].title}
                  </Text>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  style={{ maxWidth: '600px' }}
                >
                  <Text fontSize={{ base: '14px', md: '16px' }} color="gray.200" lineHeight="1.6">
                    {bannerSlides[currentSlide].description}
                  </Text>
                </motion.div>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              fontSize: '20px',
            }}
          >
            &#10094;
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              fontSize: '20px',
            }}
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
                  width: currentSlide === index ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '50px',
                  background: currentSlide === index ? '#FF8C00' : 'rgba(255, 255, 255, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Program Category Buttons */}
        <Box display="flex" gap={{ base: '12px', md: '16px' }} mb={{ base: '40px', md: '60px' }} justifyContent="center" flexWrap="wrap">
          {programs.map((program) => (
            <motion.button
              key={program.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedProgram(program.id as 'BSc' | 'GNM' | 'Post-Basic')}
              style={{
                padding: '12px 28px',
                borderRadius: '50px',
                border: `2px solid ${selectedProgram === program.id ? program.color : 'rgba(255, 255, 255, 0.2)'}`,
                background: selectedProgram === program.id ? `${program.color}20` : 'transparent',
                color: selectedProgram === program.id ? program.color : 'white',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {program.label}
            </motion.button>
          ))}
        </Box>

        {/* Books Grid */}
        <Box mb={{ base: '60px', md: '80px' }}>
          {/* Results Info */}
          <MotionBox variants={itemVariants} initial="hidden" animate="visible" mb="24px">
            <Text fontSize="15px" color="gray.300" fontWeight="500">
              Showing <strong>{filteredBooks.length}</strong> books in {programs.find(p => p.id === selectedProgram)?.label}
            </Text>
          </MotionBox>

          {/* Books Grid */}
          {filteredBooks.length > 0 ? (
            <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '20px', md: '24px' }}>
              {filteredBooks.map((book: Book) => (
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
                        src={book.image}
                        alt={book.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                      />

                      {/* Discount Badge */}
                      {book.discount > 0 && (
                        <Badge position="absolute" top="12px" right="12px" bg="linear-gradient(135deg, #FF8C00, #FFA500)" color="white" px="12px" py="6px" borderRadius="8px" fontWeight="700" fontSize="12px">
                          -{book.discount}%
                        </Badge>
                      )}

                      {/* Stock Status */}
                      {!book.inStock && (
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
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: wishlist.includes(book.id) ? 'rgba(255, 140, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          border: wishlist.includes(book.id) ? '2px solid #FF8C00' : '2px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '50%',
                          width: '44px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 5,
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
                            {book.rating}
                          </Text>
                        </Box>
                      </Box>

                      {/* Book Name */}
                      <Text fontSize={{ base: '15px', md: '16px' }} fontWeight="800" color="white" lineHeight="1.4" mb="8px">
                        {book.name.length > 50 ? `${book.name.substring(0, 50)}...` : book.name}
                      </Text>

                      {/* Author */}
                      <Text fontSize="sm" color="gray.400" mb="8px">
                        by <strong>{book.author.length > 30 ? `${book.author.substring(0, 30)}...` : book.author}</strong>
                      </Text>

                      {/* ISBN & Edition */}
                      <Box fontSize="xs" color="gray.500" mb="12px" display="flex" flexDirection="column" gap="2px">
                        <Text>ISBN: {book.isbn}</Text>
                        <Text>{book.edition}</Text>
                      </Box>

                      {/* Description */}
                      <Text fontSize="sm" color="gray.300" lineHeight="1.5" mb="12px" flex="1">
                        {book.description.length > 100 ? `${book.description.substring(0, 100)}...` : book.description}
                      </Text>

                      {/* Price Section */}
                      <Box>
                        <Box display="flex" alignItems="center" gap="8px" mb="4px">
                          <Text fontSize="18px" fontWeight="900" color="#FF8C00">
                            ₹{book.price}
                          </Text>
                          <Text fontSize="14px" color="gray.500" textDecoration="line-through">
                            ₹{book.actualPrice}
                          </Text>
                        </Box>
                        <Text fontSize="xs" color="gray.400">
                          {book.reviews} reviews
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
                Try selecting a different program
              </Text>
            </MotionBox>
          )}
        </Box>
      </Container>
    </Box>
  );
}
