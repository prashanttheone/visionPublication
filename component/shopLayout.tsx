'use client';

import { Box, Container } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Footer from '@/component/footer/Footer';
import Navbar from '@/component/navbar/Navbar';

interface ShopLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  cartCount?: number;
}

export default function ShopLayout({ children, onSearch, cartCount }: ShopLayoutProps) {
  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" minH="100vh" display="flex" flexDirection="column">
      {/* Shared Navbar */}
      <Navbar onSearch={onSearch} />

      {/* Main Content */}
      <Box flex="1" py={{ base: '20px', md: '40px' }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
