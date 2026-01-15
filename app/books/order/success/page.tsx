'use client';

import { Box, Container, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiCheckCircle } from 'react-icons/hi2';
import ShopLayout from '@/component/shopLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order_number');

    return (
        <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" bg="#0f172a">
            <Container maxW="container.md" textAlign="center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Flex justify="center" mb={6}>
                        <HiCheckCircle size={100} color="#4ade80" />
                    </Flex>
                    <Heading color="white" mb={4} size="2xl">Order Placed Successfully!</Heading>
                    <Text color="gray.400" fontSize="xl" mb={4}>
                        Thank you for your purchase. Your order has been received and is being processed.
                    </Text>
                    {orderNumber && (
                        <Text color="#60A5FA" fontSize="lg" fontWeight="bold" mb={8}>
                            Order Number: {orderNumber}
                        </Text>
                    )}
                    <Flex gap={4} justify="center">
                        <Button
                            size="lg"
                            bgGradient="linear(to-r, #3B82F6, #06B6D4)"
                            color="white"
                            _hover={{ bgGradient: 'linear(to-r, #2563EB, #0891B2)' }}
                            onClick={() => router.push('/books')}
                        >
                            Continue Shopping
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            color="white"
                            borderColor="whiteAlpha.400"
                            _hover={{ bg: 'whiteAlpha.100' }}
                            onClick={() => router.push('/books/order-history')}
                        >
                            View Order History
                        </Button>
                    </Flex>
                </motion.div>
            </Container>
        </Box>
    );
}

export default function OrderSuccessPage() {
    return (
        <ShopLayout>
            <Suspense fallback={<Box minH="80vh" bg="#0f172a" />}>
                <SuccessContent />
            </Suspense>
        </ShopLayout>
    );
}
