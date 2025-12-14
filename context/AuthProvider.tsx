'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (data: any) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    if (authUtils.isAuthenticated()) {
      const userData = authUtils.getUser();
      setUser(userData);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen to storage events to update state across tabs/windows
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for immediate updates within the same window
    window.addEventListener('auth-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleStorageChange);
    };
  }, []);

  const signIn = async (userData: any) => {
    setUser(userData);
    window.dispatchEvent(new Event('auth-update'));
  };

  const signOut = () => {
    authUtils.logout(); // This clears storage and redirects
    setUser(null);
    window.dispatchEvent(new Event('auth-update'));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
