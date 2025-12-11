'use client';

import { usePathname } from 'next/navigation';
import Header from '@/component/header/Header';
import Footer from '@/component/footer/Footer';
import { ReactNode } from 'react';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isShopLayout = pathname.startsWith('/books');

  return (
    <>
      {!isShopLayout && <Header />}
      <main>
        {children}
      </main>
      {!isShopLayout && <Footer />}
    </>
  );
}
