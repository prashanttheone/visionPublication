'use client';

import { Box, Container, Input, Badge, Flex, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useCart } from '@/context/CartContext';
import { HiMagnifyingGlass, HiShoppingCart, HiUser, HiXMark, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const MotionBox = motion.create(Box);

interface NavbarProps {
    onSearch?: (query: string) => void;
}

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Books', href: '/books' },
    { label: 'E-Resources', href: '/resources' },
    { label: 'Join As Author', href: '/join-as-author' },
    { label: 'Blog', href: '/blog' },
     { label: 'Contact', href: '/contact' },
];

const CATALOG_PDF_LINK = 'https://drive.google.com/file/d/13fzHOMvpP4K6YP3z99HOekh6vjQphCbZ/view';

export default function Navbar({ onSearch }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { cartCount } = useCart();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleSearchSubmit = (e: React.KeyboardEvent) => {
        // Only navigate if onSearch is NOT provided (Default/Global mode)
        if (!onSearch && e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/books?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (onSearch) {
            onSearch('');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    const drawerVariants = {
        hidden: { x: -300, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3 },
        },
        exit: {
            x: -300,
            opacity: 0,
            transition: { duration: 0.3 },
        },
    };

    const drawerItemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1, duration: 0.3 },
        }),
    };

    return (
        <>
            <MotionBox
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                bg="linear-gradient(135deg, #e7e7e7ff 0%, #c3c7ceff 100%)"
                borderBottom="2px solid"
                borderColor="rgba(151, 168, 181, 0.3)"
                backdropFilter="blur(10px)"
                position="sticky"
                top="0"
                zIndex="999"
                boxShadow="0 8px 32px rgba(100, 181, 246, 0.1)"
            >
                <Container maxW="full" px={{ base: '16px', md: '32px' }}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={{ base: '12px', md: '16px' }}
                        minH="70px"
                        gap={{ base: '12px', md: '24px' }}
                        flexWrap={{ base: 'wrap', lg: 'nowrap' }}
                    >
                        {/* Logo */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Box
                                fontSize={{ base: '20px', md: '24px' }}
                                fontWeight="800"
                                bgGradient="linear(to-r, #64B5F6, #90CAF9, #BBDEFB)"
                                bgClip="text"
                                cursor="pointer"
                                display="flex"
                                alignItems="center"
                                gap="8px"
                                onClick={() => router.push('/')}
                            >
                                <Box
                                    w="40px"
                                    h="40px"
                                    bgGradient="linear(to-br, #64B5F6, #42A5F5)"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="18px"
                                    fontWeight="bold"
                                    color="white"
                                >
                                    VP
                                </Box>
                                <Box display={{ base: 'none', sm: 'block' }}>
                                    VISIONPUBLICATIONS
                                </Box>
                            </Box>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <Box
                            as="nav"
                            display={{ base: 'none', xl: 'flex' }}
                            gap="16px"
                            alignItems="center"
                        >
                            {navItems.map((item) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Box
                                        position="relative"
                                        color="white"
                                        fontSize="sm"
                                        fontWeight="500"
                                        cursor="pointer"
                                        whiteSpace="nowrap"
                                        _before={{
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '2px',
                                            bgGradient: 'linear(to-r, #64B5F6, #42A5F5)',
                                            transform: 'scaleX(0)',
                                            transformOrigin: 'right',
                                            transition: 'transform 0.3s ease',
                                        }}
                                        _hover={{
                                            _before: {
                                                transform: 'scaleX(1)',
                                                transformOrigin: 'left',
                                            },
                                        }}
                                    >
                                        {item.label}
                                    </Box>
                                </motion.a>
                            ))}
                        </Box>

                        {/* Search Bar */}
                        <Box
                            flex={{ base: '0 0 100%', sm: '1', lg: '0 1 300px' }}
                            position="relative"
                            order={{ base: 4, lg: 'unset' }}
                            mt={{ base: '12px', lg: '0' }}
                            maxW="400px"
                        >
                            <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" zIndex={2} color="gray.400">
                                <HiMagnifyingGlass size={18} />
                            </Box>

                            <Input
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchSubmit}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                pl="40px"
                                pr={searchQuery ? '40px' : '12px'}
                                py="10px"
                                fontSize={{ base: '13px', md: '14px' }}
                                fontWeight="500"
                                bg="rgba(30, 41, 59, 0.6)"
                                border="1px solid"
                                borderColor={isFocused ? 'rgba(100, 181, 246, 0.5)' : 'rgba(100, 181, 246, 0.2)'}
                                color="white"
                                _placeholder={{
                                    color: 'gray.400',
                                }}
                                _focus={{
                                    outline: 'none',
                                    borderColor: 'rgba(100, 181, 246, 0.5)',
                                    bg: 'rgba(30, 41, 59, 0.8)',
                                }}
                                _hover={{
                                    borderColor: 'rgba(100, 181, 246, 0.3)',
                                }}
                                backdropFilter="blur(10px)"
                                transition="all 0.2s ease"
                            />

                            {/* Clear Button */}
                            {searchQuery && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={clearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '6px',
                                        zIndex: 3,
                                    }}
                                >
                                    <HiXMark size={18} color="#64B5F6" />
                                </motion.button>
                            )}
                        </Box>

                        {/* Right Actions */}
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={{ base: '8px', md: '16px' }}
                            ml={{ base: '0', lg: 'auto' }}
                            order={{ base: 3, lg: 'unset' }}
                            w={{ base: '100%', sm: 'auto' }}
                            justifyContent={{ base: 'space-between', sm: 'flex-end' }}
                            flexShrink={0}
                        >
                            {user ? (
                                <Flex align="center" gap="12px">
                                    <Flex align="center" gap="8px" display={{ base: 'none', md: 'flex' }}>
                                        <Box
                                            w="24px"
                                            h="24px"
                                            borderRadius="full"
                                            bgGradient="linear(to-br, #64B5F6, #42A5F5)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize="10px"
                                            fontWeight="bold"
                                            color="white"
                                            overflow="hidden"
                                        >
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                                            ) : (
                                                (user.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()
                                            )}
                                        </Box>
                                        <Text color="white" fontWeight="600" fontSize="14px">
                                            {user.full_name || user.email?.split('@')[0] || 'User'}
                                        </Text>
                                    </Flex>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={signOut}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(100, 181, 246, 0.3)',
                                            background: 'transparent',
                                            color: '#64B5F6',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.3)';
                                        }}
                                    >
                                        <HiArrowRightOnRectangle size={18} />
                                        <Box display={{ base: 'none', sm: 'block' }}>Logout</Box>
                                    </motion.button>
                                </Flex>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/login')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(100, 181, 246, 0.3)',
                                        background: 'transparent',
                                        color: '#64B5F6',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(100, 181, 246, 0.1)';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 181, 246, 0.3)';
                                    }}
                                >
                                    <HiUser size={18} />
                                    <Box display={{ base: 'none', sm: 'block' }}>Login</Box>
                                </motion.button>
                            )}

                            {/* Cart Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/books/cart')}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 140, 0, 0.3)',
                                    background: 'rgba(255, 140, 0, 0.05)',
                                    color: '#FF8C00',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 140, 0, 0.15)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 140, 0, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 140, 0, 0.05)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 140, 0, 0.3)';
                                }}
                            >
                                <HiShoppingCart size={18} />
                                {cartCount > 0 && (
                                    <Badge
                                        position="absolute"
                                        top="-6px"
                                        right="-6px"
                                        bg="linear-gradient(135deg, #FF8C00, #FFA500)"
                                        color="white"
                                        borderRadius="full"
                                        fontSize="10px"
                                        fontWeight="700"
                                        minW="20px"
                                        h="20px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </Badge>
                                )}
                                <Box display={{ base: 'none', sm: 'block' }} ml="4px">
                                    Cart
                                </Box>
                            </motion.button>
                        </Box>

                        {/* Mobile Menu Button */}
                        <Box
                            display={{ base: 'flex', xl: 'none' }}
                            as="button"
                            onClick={() => setIsOpen(!isOpen)}
                            bg="transparent"
                            border="none"
                            cursor="pointer"
                            p="8px"
                            color="white"
                            _hover={{ bg: 'rgba(100, 181, 246, 0.1)' }}
                            borderRadius="md"
                        >
                            {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
                        </Box>
                    </Box>
                </Container>
            </MotionBox>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                top: '80px',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backdropFilter: 'blur(4px)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 40,
                            }}
                        />

                        {/* Drawer */}
                        <MotionBox
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            position="fixed"
                            top="80px"
                            left="0"
                            width="100%"
                            maxW="300px"
                            bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                            borderRight="2px solid rgba(100, 181, 246, 0.3)"
                            zIndex="50"
                            height="calc(100vh - 80px)"
                            overflowY="auto"
                            py="16px"
                            px="16px"
                        >
                            <Box display="flex" flexDirection="column" gap="8px">
                                {navItems.map((item, index) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        custom={index}
                                        variants={drawerItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            display: 'block',
                                            padding: '16px 20px',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <Box
                                            color="white"
                                            fontSize="lg"
                                            fontWeight="600"
                                            cursor="pointer"
                                            _hover={{
                                                bgGradient: 'linear(to-r, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.1))',
                                                pl: '16px',
                                                color: '#64B5F6',
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            {item.label}
                                        </Box>
                                    </motion.a>
                                ))}

                                {/* Mobile Catalog Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        window.open(CATALOG_PDF_LINK, '_blank');
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        padding: '12px 20px',
                                        marginTop: '8px',
                                        borderRadius: '10px',
                                        border: '2px solid white',
                                        backgroundColor: 'white',
                                        color: '#0f172a',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        width: '100%',
                                        textAlign: 'center',
                                    }}
                                >
                                    Catalog
                                </motion.button>
                            </Box>
                        </MotionBox>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
