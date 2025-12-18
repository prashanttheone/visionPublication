'use client';

import { usePathname } from 'next/navigation';
import Header from '@/component/header/Header';
import Footer from '@/component/footer/Footer';
import { ReactNode, useEffect, useState } from 'react';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isShopLayout = pathname?.startsWith('/books') || false;
  const isAdminLayout = pathname?.startsWith('/admin') || false;

  return (
    <>
      {isMounted && !isShopLayout && !isAdminLayout && <Header />}
      <main>
        {children}
      </main>
      {isMounted && !isShopLayout && !isAdminLayout && <Footer />}
    </>
  );
}
