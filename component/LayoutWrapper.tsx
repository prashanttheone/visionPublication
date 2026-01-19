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
  // const isAuthLayout = pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/auth');
  const showHeaderFooter = isMounted && !isShopLayout && !isAdminLayout ;

  return (
    <div suppressHydrationWarning>
      {showHeaderFooter && <Header />}
      <main suppressHydrationWarning>
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
