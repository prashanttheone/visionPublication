'use client';

import { useState } from 'react';
import { Box, Container, Stack, Heading, Text, Input, Button, Flex, Grid, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import ShopLayout from '@/component/shopLayout';
import { toaster } from '@/component/ui/toaster';

const MotionBox = motion.create(Box);

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India', // Default
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total: cartTotal,
                    shippingAddress: formData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to place order');
            }

            // Success
            clearCart();
            toaster.create({
                title: 'Order Placed!',
                description: 'Your order has been placed successfully.',
                type: 'success',
                duration: 5000,
            });
            router.push('/books/order/success'); // Redirect to success page (need to create/update this)

        } catch (error: any) {
            toaster.create({
                title: 'Order Failed',
                description: error.message,
                type: 'error',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (cart.length === 0) {
        // Redirect or show empty state if cart is empty (optional refinement, for now simple return)
        return (
            <ShopLayout>
                <Container maxW="container.md" py={20} textAlign="center">
                    <Heading color="white">Your Cart is Empty</Heading>
                    <Button mt={4} onClick={() => router.push('/books')}>Go Shopping</Button>
                </Container>
            </ShopLayout>
        )
    }

    return (
        <ShopLayout>
            <Box minH="100vh" bg="linear-gradient(135deg, #0f172a 0%, #1a2332 100%)" py={10}>
                <Container maxW="1200px">
                    <Heading color="white" mb={8} size="xl">Checkout</Heading>
                    <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={8}>

                        {/* Left Column: Shipping Form */}
                        <MotionBox
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            bg="rgba(30, 41, 59, 0.6)"
                            p={8}
                            borderRadius="2xl"
                            border="1px solid rgba(100, 181, 246, 0.2)"
                        >
                            <Heading size="md" color="blue.400" mb={6}>Shipping Address</Heading>
                            <Stack gap={4} as="form" onSubmit={handleSubmit}>
                                <Input
                                    placeholder="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    bg="rgba(0,0,0,0.2)"
                                    color="white"
                                    borderColor="gray.600"
                                />
                                <Input
                                    placeholder="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    bg="rgba(0,0,0,0.2)"
                                    color="white"
                                    borderColor="gray.600"

                                />
                                <Input
                                    placeholder="Street Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    bg="rgba(0,0,0,0.2)"
                                    color="white"
                                    borderColor="gray.600"
                                />
                                <Grid templateColumns="1fr 1fr" gap={4}>
                                    <Input
                                        placeholder="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        bg="rgba(0,0,0,0.2)"
                                        color="white"
                                        borderColor="gray.600"
                                    />
                                    <Input
                                        placeholder="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        bg="rgba(0,0,0,0.2)"
                                        color="white"
                                        borderColor="gray.600"
                                    />
                                </Grid>
                                <Grid templateColumns="1fr 1fr" gap={4}>
                                    <Input
                                        placeholder="ZIP Code"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        required
                                        bg="rgba(0,0,0,0.2)"
                                        color="white"
                                        borderColor="gray.600"
                                    />
                                    <Input
                                        placeholder="Country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        readOnly
                                        bg="rgba(0,0,0,0.2)"
                                        color="gray.400"
                                        borderColor="gray.600"
                                    />
                                </Grid>

                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    size="lg"
                                    mt={4}
                                    isLoading={isLoading}
                                    bgGradient="linear(to-r, #3B82F6, #06B6D4)"
                                    _hover={{ bgGradient: 'linear(to-r, #2563EB, #0891B2)' }}
                                >
                                    Place Order (₹{cartTotal})
                                </Button>
                            </Stack>
                        </MotionBox>

                        {/* Right Column: Order Summary */}
                        <MotionBox
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Box
                                bg="rgba(30, 41, 59, 0.8)"
                                p={8}
                                borderRadius="2xl"
                                border="1px solid rgba(100, 181, 246, 0.2)"
                                position="sticky"
                                top="100px"
                            >
                                <Heading size="md" color="white" mb={6}>Order Summary</Heading>
                                <Stack gap={4}>
                                    {cart.map((item) => (
                                        <Flex key={item.id} justify="space-between" align="center">
                                            <Flex align="center" gap={3}>
                                                <Box w="50px" h="70px" borderRadius="md" overflow="hidden">
                                                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                                <Box>
                                                    <Text color="white" fontWeight="600" noOfLines={1}>{item.name}</Text>
                                                    <Text color="gray.400" fontSize="sm">Qty: {item.quantity}</Text>
                                                </Box>
                                            </Flex>
                                            <Text color="white" fontWeight="600">₹{item.price * item.quantity}</Text>
                                        </Flex>
                                    ))}
                                    <Box h="1px" bg="gray.600" my={2} />
                                    <Flex justify="space-between">
                                        <Text color="gray.300">Subtotal</Text>
                                        <Text color="white">₹{cartTotal}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text color="gray.300">Shipping</Text>
                                        <Text color="green.400">Free</Text>
                                    </Flex>
                                    <Box h="1px" bg="gray.600" my={2} />
                                    <Flex justify="space-between" align="center">
                                        <Text color="white" fontSize="lg" fontWeight="bold">Total</Text>
                                        <Text color="blue.400" fontSize="xl" fontWeight="bold">₹{cartTotal}</Text>
                                    </Flex>
                                </Stack>
                            </Box>
                        </MotionBox>
                    </Grid>
                </Container>
            </Box>
        </ShopLayout>
    );
}
