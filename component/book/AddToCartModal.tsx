'use client';

import { Dialog, Box, Text, Button, Stack, Flex } from '@chakra-ui/react';
import { HiShoppingCart, HiCheckCircle } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookName: string;
}

export default function AddToCartModal({ isOpen, onClose, bookName }: AddToCartModalProps) {
    const router = useRouter();

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner justifyContent="center" alignItems="center">
                <Dialog.Content
                    borderRadius="24px"
                    p="0"
                    overflow="hidden"
                    boxShadow="0 40px 80px rgba(0,0,0,0.15)"
                    bg="white"
                    maxW="400px"
                >
                    <Box p="40px" textAlign="center" position="relative">
                        {/* Close button visualization implied by clicking outside or specific cancel button */}

                        {/* Illustration */}
                        <Flex justify="center" mb="24px">
                            <Box
                                w="80px"
                                h="80px"
                                bg="rgba(100, 181, 246, 0.2)"
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <HiShoppingCart size={40} color="#0f172a" />
                                <Box position="absolute" mt="-40px" ml="40px" bg="#10b981" borderRadius="full" p="4px" border="4px solid white">
                                    <HiCheckCircle size={20} color="white" />
                                </Box>
                            </Box>
                        </Flex>

                        <Dialog.Title fontSize="22px" fontWeight="800" mb="12px" color="#1a202c">
                            Added to Cart!
                        </Dialog.Title>
                        <Dialog.Description fontSize="15px" color="gray.500" mb="32px" lineHeight="1.6">
                            <strong>{bookName}</strong> has been successfully added to your cart.
                        </Dialog.Description>

                        <Stack gap="12px" direction="row" justify="center">
                            <Button
                                variant="outline"
                                borderRadius="12px"
                                py="12px"
                                px="20px"
                                fontSize="14px"
                                fontWeight="600"
                                onClick={onClose}
                                borderColor="gray.200"
                                color="gray.600"
                                _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                                flex="1"
                            >
                                Keep Shopping
                            </Button>
                            <Button
                                bg="#0f172a"
                                color="white"
                                borderRadius="12px"
                                py="12px"
                                px="20px"
                                fontSize="14px"
                                fontWeight="600"
                                onClick={() => router.push('/books/cart')}
                                _hover={{ bg: "#1e293b" }}
                                flex="1"
                            >
                                Go to Cart
                            </Button>
                        </Stack>
                    </Box>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
