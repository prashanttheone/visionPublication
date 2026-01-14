'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import AdminLayoutClient from '@/component/adminComponet/AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
    } else if (!authUtils.isAdmin()) {
      router.push('/');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  // Don't render children until verification is complete to prevent flashing
  if (!isVerified) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Verifying access...
      </div>
    );
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
