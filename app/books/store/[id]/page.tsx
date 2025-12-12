'use client';

import { Box, Container, Text, Badge, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HiStar, HiHeart, HiShoppingCart } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface Book {
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
}

export default function BookDetailPage() {
  const params = useParams();
  const bookId = Number(params.id);
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch book details
        const bookRes = await fetch(`/api/book/${bookId}`);
        const bookData = await bookRes.json();
        
        if (bookData.success && bookData.data) {
          // API returns { success, data: { book, courseMappings } }
          const bookInfo = bookData.data.book || bookData.data;
          setBook(bookInfo);
          setError(null);
          
          // Fetch all books to find related books in same category
          const allBooksRes = await fetch('/api/book');
          const allBooksData = await allBooksRes.json();
          
          if (allBooksData.success && allBooksData.data) {
            const related = allBooksData.data
              .filter((b: Book) => b.category === bookInfo.category && b.id !== bookId)
              .slice(0, 3);
            setRelatedBooks(related);
          }
        } else {
          setError('Book not found');
          setBook(null);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  if (isLoading) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" display="flex" alignItems="center" justifyContent="center" py={{ base: '60px', md: '80px' }}>
        <Container maxW="1400px" textAlign="center">
          <Text fontSize="24px" fontWeight="700" color="white">
            Loading book details...
          </Text>
        </Container>
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" display="flex" alignItems="center" justifyContent="center" py={{ base: '60px', md: '80px' }}>
        <Container maxW="1400px" textAlign="center">
          <Text fontSize="24px" fontWeight="700" color="white" mb="16px">
            {error || 'Book not found'}
          </Text>
          <Text fontSize="16px" color="gray.300">
            The book you're looking for doesn't exist.
          </Text>
        </Container>
      </Box>
    );
  }

  const calculateDiscount = (actualPrice: number, offerPrice: number) => {
    if (actualPrice <= 0) return 0;
    return Math.round(((actualPrice - offerPrice) / actualPrice) * 100);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="1400px" px={{ base: '16px', md: '32px' }} position="relative" zIndex={1}>
        {/* Book Details Section */}
        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: '32px', md: '48px' }} mb={{ base: '60px', md: '80px' }}>
          {/* Book Image */}
          <MotionBox variants={itemVariants} initial="hidden" animate="visible">
            <Box position="relative" borderRadius="16px" overflow="hidden" height={{ base: '400px', md: '500px' }} bg="rgba(100, 181, 246, 0.1)">
              <img
                src={book.image_url || 'https://via.placeholder.com/500x700?text=No+Image'}
                alt={book.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {calculateDiscount(book.actual_price, book.offer_price) > 0 && (
                <Badge position="absolute" top="20px" right="20px" bg="linear-gradient(135deg, #FF8C00, #FFA500)" color="white" px="16px" py="8px" borderRadius="12px" fontWeight="700" fontSize="16px">
                  -{calculateDiscount(book.actual_price, book.offer_price)}%
                </Badge>
              )}
            </Box>
          </MotionBox>

          {/* Book Info */}
          <MotionBox variants={itemVariants} initial="hidden" animate="visible" display="flex" flexDirection="column" justifyContent="center">
            {/* Category Badge */}
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px" mb="16px" w="fit-content">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                {book.category}
              </Text>
            </Box>

            {/* Title */}
            <Text fontSize={{ base: '28px', md: '36px' }} fontWeight="900" lineHeight="1.2" color="white" mb="16px">
              {book.name}
            </Text>

            {/* Author */}
            <Text fontSize="18px" color="gray.300" mb="8px">
              by <strong>{book.author}</strong>
            </Text>

            {/* Rating & Reviews */}
            <Box display="flex" alignItems="center" gap="12px" mb="24px">
              <Box display="flex" alignItems="center" gap="4px">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} size={18} color="#FF8C00" fill={i < Math.floor(book.rating) ? '#FF8C00' : 'none'} />
                ))}
              </Box>
              <Text fontSize="16px" fontWeight="600" color="white">
                {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
              </Text>
              <Text fontSize="14px" color="gray.400">
                ({book.reviews_count} reviews)
              </Text>
            </Box>

            {/* ISBN & Edition */}
            <Box display="flex" flexDirection="column" gap="8px" mb="24px" pb="24px" borderBottom="1px solid rgba(255, 255, 255, 0.1)">
              <Box display="flex" gap="16px">
                <Text fontSize="14px" color="gray.400">
                  <strong>ISBN:</strong> {book.isbn}
                </Text>
              </Box>
              <Box display="flex" gap="16px">
                <Text fontSize="14px" color="gray.400">
                  <strong>Edition:</strong> {book.edition}
                </Text>
              </Box>
            </Box>

            {/* Price */}
            <Box mb="24px">
              <Box display="flex" alignItems="center" gap="16px" mb="8px">
                <Text fontSize={{ base: '32px', md: '40px' }} fontWeight="900" color="#FF8C00">
                  ₹{book.offer_price}
                </Text>
                <Text fontSize={{ base: '20px', md: '24px' }} color="gray.500" textDecoration="line-through">
                  ₹{book.actual_price}
                </Text>
              </Box>
              <Text fontSize="16px" color="#90CAF9" fontWeight="600">
                Save ₹{book.actual_price - book.offer_price} ({calculateDiscount(book.actual_price, book.offer_price)}% off)
              </Text>
            </Box>

            {/* Stock Status */}
            <Box mb="24px">
              <Text fontSize="16px" fontWeight="600" color={book.in_stock ? '#90CAF9' : '#FF6B6B'}>
                {book.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
              </Text>
            </Box>

            {/* Quantity Selector */}
            <Box display="flex" alignItems="center" gap="16px" mb="24px">
              <Text fontSize="16px" fontWeight="600" color="white">
                Quantity:
              </Text>
              <Box display="flex" alignItems="center" border="1px solid rgba(255, 255, 255, 0.2)" borderRadius="8px" overflow="hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  −
                </motion.button>
                <Text fontSize="16px" fontWeight="600" color="white" px="16px" py="8px">
                  {quantity}
                </Text>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  +
                </motion.button>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap="16px" mb="24px">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!book.in_stock}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  background: book.in_stock ? 'linear-gradient(135deg, #FF8C00, #FFA500)' : 'rgba(100, 100, 100, 0.3)',
                  color: 'white',
                  cursor: book.in_stock ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  opacity: book.in_stock ? 1 : 0.6,
                }}
              >
                <HiShoppingCart size={20} />
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  border: `2px solid ${isWishlisted ? '#FF8C00' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '10px',
                  background: isWishlisted ? 'rgba(255, 140, 0, 0.1)' : 'transparent',
                  color: isWishlisted ? '#FF8C00' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
              >
                <HiHeart size={20} fill={isWishlisted ? '#FF8C00' : 'none'} />
              </motion.button>
            </Box>

            {/* Buy Now Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!book.in_stock}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '10px',
                background: book.in_stock ? 'linear-gradient(135deg, #64B5F6, #42A5F5)' : 'rgba(100, 100, 100, 0.3)',
                color: 'white',
                cursor: book.in_stock ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: book.in_stock ? 1 : 0.6,
              }}
            >
              Buy Now
            </motion.button>
          </MotionBox>
        </Grid>

        {/* Description Section */}
        <MotionBox variants={itemVariants} initial="hidden" animate="visible" mb={{ base: '60px', md: '80px' }}>
          <Text fontSize="24px" fontWeight="900" color="white" mb="16px">
            About This Book
          </Text>
          <Text fontSize="16px" color="gray.300" lineHeight="1.8">
            {book.description}
          </Text>
        </MotionBox>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <MotionBox variants={itemVariants} initial="hidden" animate="visible">
            <Text fontSize="24px" fontWeight="900" color="white" mb="24px">
              Related Books in {book.category}
            </Text>
            <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={{ base: '20px', md: '24px' }}>
              {relatedBooks.map((relatedBook) => (
                <Box
                  key={relatedBook.id}
                  bg="rgba(30, 41, 59, 0.6)"
                  border="1px solid rgba(100, 181, 246, 0.2)"
                  borderRadius="16px"
                  overflow="hidden"
                  backdropFilter="blur(10px)"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: 'rgba(100, 181, 246, 0.4)',
                  }}
                  cursor="pointer"
                >
                  <Box position="relative" width="100%" height="220px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                    <img
                      src={relatedBook.image_url || 'https://via.placeholder.com/500x700?text=No+Image'}
                      alt={relatedBook.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <Box p="16px">
                    <Text fontSize="14px" fontWeight="700" color="white" mb="8px" maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="normal" css={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>
                      {relatedBook.name}
                    </Text>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="16px" fontWeight="900" color="#FF8C00">
                        ₹{relatedBook.offer_price}
                      </Text>
                      <Box display="flex" alignItems="center" gap="4px">
                        <HiStar size={14} color="#FF8C00" fill="#FF8C00" />
                        <Text fontSize="12px" color="gray.300">
                          {typeof relatedBook.rating === 'number' ? relatedBook.rating.toFixed(1) : relatedBook.rating}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Grid>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
