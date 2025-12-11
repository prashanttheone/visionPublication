import { ReactNode } from 'react';
import ShopLayout from '@/component/shopLayout';

export default function BooksLayout({ children }: { children: ReactNode }) {
  return (
    <ShopLayout cartCount={0}>
      {children}
    </ShopLayout>
  );
}
