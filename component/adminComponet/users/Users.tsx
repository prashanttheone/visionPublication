'use client';

import { Box, Container, Text, Badge, Button, Flex, Input, IconButton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiTrash, HiPencil } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface User {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/users');
            const data = await res.json();

            if (data.success) {
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" py={{ base: '40px', md: '60px' }}>
            <Container maxW="1200px" px={{ base: '16px', md: '32px' }}>
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    mb="40px"
                >
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap="20px">
                        <Box>
                            <Text fontSize={{ base: '24px', md: '32px' }} fontWeight="900" color="white" mb="8px">
                                Users Management
                            </Text>
                            <Text color="gray.400">
                                View and manage registered users
                            </Text>
                        </Box>

                        <Box position="relative" w={{ base: '100%', md: '300px' }}>
                            <Input
                                placeholder="Search users..."
                                bg="rgba(30, 41, 59, 0.6)"
                                border="1px solid rgba(100, 181, 246, 0.2)"
                                color="white"
                                _placeholder={{ color: 'gray.500' }}
                                pl="40px"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" color="gray.500">
                                <HiMagnifyingGlass />
                            </Box>
                        </Box>
                    </Flex>
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    bg="rgba(30, 41, 59, 0.6)"
                    border="1px solid rgba(100, 181, 246, 0.2)"
                    borderRadius="16px"
                    overflow="hidden"
                    backdropFilter="blur(10px)"
                >
                    <Box overflowX="auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                <tr>
                                    <th style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'left' }}>User</th>
                                    <th style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'left' }}>Role</th>
                                    <th style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'left' }}>Status</th>
                                    <th style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'left' }}>Joined Date</th>
                                    <th style={{ color: '#A0AEC0', borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#A0AEC0' }}>
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#A0AEC0' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} style={{ transition: 'background 0.2s' }}>
                                            <td style={{ borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px' }}>
                                                <Box>
                                                    <Text color="white" fontWeight="600">{user.full_name}</Text>
                                                    <Text color="gray.400" fontSize="13px">{user.email}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px' }}>
                                                <Badge
                                                    colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                                                    variant="subtle"
                                                    borderRadius="full"
                                                    px="2"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td style={{ borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px' }}>
                                                <Badge
                                                    colorScheme={user.is_active ? 'green' : 'red'}
                                                    variant="subtle"
                                                    borderRadius="full"
                                                    px="2"
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td style={{ borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', color: '#CBD5E0' }}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ borderBottom: '1px solid rgba(100, 181, 246, 0.1)', padding: '16px', textAlign: 'right' }}>
                                                <IconButton
                                                    aria-label="Delete user"
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => console.log('Delete feature coming soon')}
                                                >
                                                    <HiTrash />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Box>
                </MotionBox>
            </Container>
        </Box>
    );
}
