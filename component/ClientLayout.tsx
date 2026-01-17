'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Toaster } from '@/component/ui/toaster';
import { App, ConfigProvider, theme } from 'antd';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <App>
        <ChakraProvider value={defaultSystem}>
          {children}
          <Toaster />
        </ChakraProvider>
      </App>
    </ConfigProvider>
  );
}
