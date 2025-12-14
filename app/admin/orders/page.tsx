'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Heading, Table, Badge, Text, Spinner } from '@chakra-ui/react';
// Assuming layout exists, or we might need to wrap it. Admin pages usually have sidebar.
// Checking admin/layout.tsx might be good but let's assume it provides the shell.

interface Order {
    id: number;
    full_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    city: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    return (
        <Box p={8} bg="#0f172a" minH="100vh">
            <Container maxW="container.xl">
                <Heading color="white" mb={8}>Order Management</Heading>

                {isLoading ? (
                    <Spinner color="blue.500" size="xl" />
                ) : (
                    <Box overflowX="auto" bg="rgba(30, 41, 59, 0.6)" borderRadius="xl" border="1px solid rgba(255,255,255,0.1)">
                        <Table.Root variant="outline" colorScheme="whiteAlpha">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader color="gray.400">Order ID</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.400">Customer</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.400">Date</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.400">Location</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.400">Total</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.400">Status</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body color="white">
                                {orders.map((order) => (
                                    <Table.Row key={order.id} _hover={{ bg: 'whiteAlpha.50' }}>
                                        <Table.Cell>#{order.id}</Table.Cell>
                                        <Table.Cell fontWeight="bold">{order.full_name}</Table.Cell>
                                        <Table.Cell>{new Date(order.created_at).toLocaleDateString()}</Table.Cell>
                                        <Table.Cell>{order.city}</Table.Cell>
                                        <Table.Cell color="green.400" fontWeight="bold">₹{order.total_amount}</Table.Cell>
                                        <Table.Cell>
                                            <Badge
                                                colorPalette={order.status === 'completed' ? 'green' : 'yellow'}
                                                variant="solid"
                                                borderRadius="full"
                                                px={3}
                                            >
                                                {order.status}
                                            </Badge>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                                {orders.length === 0 && (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} textAlign="center" py={8} color="gray.500">
                                            No orders found.
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
