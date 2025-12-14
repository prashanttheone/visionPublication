'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Toaster } from '@/component/ui/toaster';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
      <Toaster />
    </ChakraProvider>
  );
}
