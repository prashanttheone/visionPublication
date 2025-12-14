'use client';

import { Box, Container, Flex, Text, Button, Image, IconButton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiTrash, HiMinus, HiPlus, HiArrowLeft } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useCart } from '@/context/CartContext';
import ShopLayout from '../shopLayout';
import { toaster } from '@/component/ui/toaster';

const MotionBox = motion.create(Box);

export default function Cart() {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    const handleCheckout = () => {
        if (!user) {
            toaster.create({
                title: 'Login Required',
                description: 'Please login to proceed with checkout.',
                type: 'warning',
                duration: 4000,
            });
            router.push('/login?returnTo=/books/checkout');
            return;
        }
        router.push('/books/checkout');
    };

    return (
        <ShopLayout>
            <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
                <Container maxW="1200px">
                    {/* Header */}
                    <Box mb="40px">
                        <Button
                            onClick={() => router.back()}
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                            mb="20px"
                            display="inline-flex"
                            alignItems="center"
                            gap="8px"
                        >
                            <HiArrowLeft />
                            Continue Shopping
                        </Button>
                        <Text fontSize="32px" fontWeight="800" color="white">
                            Shopping Cart ({cart.length} items)
                        </Text>
                    </Box>

                    {cart.length === 0 ? (
                        <Box
                            textAlign="center"
                            py="100px"
                            bg="rgba(30, 41, 59, 0.4)"
                            borderRadius="24px"
                            border="1px solid rgba(100, 181, 246, 0.2)"
                        >
                            <Text fontSize="24px" fontWeight="700" color="white" mb="8px">
                                Your cart is empty
                            </Text>
                            <Text color="gray.400" mb="32px">
                                Looks like you haven't added any books yet.
                            </Text>
                            <Button
                                onClick={() => router.push('/books')}
                                bgGradient="linear(to-r, #64B5F6, #42A5F5)"
                                color="white"
                                _hover={{ bgGradient: 'linear(to-r, #42A5F5, #2196F3)' }}
                                size="lg"
                                px="32px"
                            >
                                Browse Books
                            </Button>
                        </Box>
                    ) : (
                        <Flex direction={{ base: 'column', lg: 'row' }} gap="40px">
                            {/* Cart Items */}
                            <Box flex="1">
                                <Box display="flex" flexDirection="column" gap="24px">
                                    {cart.map((item) => (
                                        <MotionBox
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            bg="rgba(30, 41, 59, 0.6)"
                                            border="1px solid rgba(100, 181, 246, 0.2)"
                                            borderRadius="16px"
                                            p="24px"
                                            display="flex"
                                            gap="24px"
                                            alignItems="center"
                                            flexDirection={{ base: 'column', sm: 'row' }}
                                        >
                                            {/* Image */}
                                            <Box
                                                w={{ base: '100px', sm: '80px' }}
                                                h={{ base: '140px', sm: '120px' }}
                                                flexShrink={0}
                                                borderRadius="12px"
                                                overflow="hidden"
                                                bg="rgba(0,0,0,0.2)"
                                            >
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    w="100%"
                                                    h="100%"
                                                    objectFit="cover"
                                                />
                                            </Box>

                                            {/* Details */}
                                            <Box flex="1" w="100%">
                                                <Flex justify="space-between" mb="8px" align="flex-start">
                                                    <Box>
                                                        <Text fontSize="18px" fontWeight="700" color="white" mb="4px">
                                                            {item.name}
                                                        </Text>
                                                        <Text fontSize="14px" color="gray.400">
                                                            by {item.author}
                                                        </Text>
                                                    </Box>
                                                    <Text fontSize="20px" fontWeight="700" color="#FF8C00">
                                                        ₹{item.price * item.quantity}
                                                    </Text>
                                                </Flex>

                                                <Flex justify="space-between" align="center" mt="16px">
                                                    {/* Quantity Controls */}
                                                    <Flex align="center" bg="rgba(0,0,0,0.2)" borderRadius="8px" p="4px">
                                                        <IconButton
                                                            aria-label="Decrease quantity"

                                                            size="sm"
                                                            variant="ghost"
                                                            color="white"
                                                            _hover={{ bg: 'whiteAlpha.100' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <HiMinus size={14} />
                                                        </IconButton>
                                                        <Text color="white" fontWeight="600" mx="12px">
                                                            {item.quantity}
                                                        </Text>
                                                        <IconButton
                                                            aria-label="Increase quantity"
                                                            size="sm"
                                                            variant="ghost"
                                                            color="white"
                                                            _hover={{ bg: 'whiteAlpha.100' }}
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <HiPlus size={14} />
                                                        </IconButton>
                                                    </Flex>

                                                    {/* Remove Button */}
                                                    <Button
                                                        variant="ghost"
                                                        color="red.400"
                                                        size="sm"
                                                        _hover={{ bg: 'red.400', color: 'white' }}
                                                        onClick={() => removeFromCart(item.id)}
                                                        display="inline-flex"
                                                        alignItems="center"
                                                        gap="8px"
                                                    >
                                                        <HiTrash />
                                                        Remove
                                                    </Button>
                                                </Flex>
                                            </Box>
                                        </MotionBox>
                                    ))}
                                </Box>
                            </Box>

                            {/* Order Summary */}
                            <Box w={{ base: '100%', lg: '350px' }}>
                                <Box
                                    bg="rgba(30, 41, 59, 0.8)"
                                    border="1px solid rgba(100, 181, 246, 0.3)"
                                    borderRadius="24px"
                                    p="32px"
                                    position="sticky"
                                    top="100px"
                                >
                                    <Text fontSize="20px" fontWeight="700" color="white" mb="24px">
                                        Order Summary
                                    </Text>

                                    <Flex justify="space-between" mb="16px">
                                        <Text color="gray.400">Subtotal</Text>
                                        <Text color="white" fontWeight="600">₹{cartTotal}</Text>
                                    </Flex>
                                    <Flex justify="space-between" mb="16px">
                                        <Text color="gray.400">Shipping</Text>
                                        <Text color="green.400" fontWeight="600">Free</Text>
                                    </Flex>

                                    <Box h="1px" bg="whiteAlpha.200" my="20px" />

                                    <Flex justify="space-between" mb="32px">
                                        <Text color="white" fontSize="18px" fontWeight="700">Total</Text>
                                        <Text color="#FF8C00" fontSize="24px" fontWeight="800">₹{cartTotal}</Text>
                                    </Flex>

                                    <Button
                                        w="100%"
                                        height="56px"
                                        bgGradient="linear(to-r, #FF8C00, #FFA500)"
                                        color="white"
                                        fontSize="18px"
                                        fontWeight="700"
                                        _hover={{ bgGradient: 'linear(to-r, #FFA500, #FFB74D)', transform: 'translateY(-2px)' }}
                                        transition="all 0.2s"
                                        onClick={handleCheckout}
                                        boxShadow="0 4px 20px rgba(255, 140, 0, 0.3)"
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </Box>
                            </Box>
                        </Flex>
                    )}
                </Container>
            </Box>
        </ShopLayout>
    );
}
