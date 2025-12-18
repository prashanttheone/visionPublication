'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Button,
  Text,
  Link,
  Heading,
  Input,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { authUtils } from '@/lib/auth';

const MotionBox = motion.create(Box);

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to login');
        return;
      }

      // Store token and user data using auth utility
      authUtils.setAuthToken(data.token, data.user);

      // Notify AuthProvider
      window.dispatchEvent(new Event('auth-update'));

      // Small delay to ensure cookies are set before redirect
      setTimeout(() => {
        // Check user role and redirect accordingly
        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (returnTo) {
          window.location.href = returnTo;
        } else {
          window.location.href = '/';
        }
      }, 300);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('🔐 Google login coming soon - Configure Google OAuth in your application');
  };

  return (
    <Box
      minH="100vh"
      w="full"
      bg="linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Elements */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="600px"
        h="600px"
        bg="blue.500"
        filter="blur(150px)"
        opacity="0.1"
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="500px"
        h="500px"
        bg="cyan.500"
        filter="blur(150px)"
        opacity="0.1"
        borderRadius="full"
      />

      <Container maxW="md" px="4">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          bg="rgba(255, 255, 255, 0.03)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(255, 255, 255, 0.05)"
          borderRadius="24px"
          p={{ base: 6, md: 8 }}
          boxShadow="0 4px 40px rgba(0, 0, 0, 0.4)"
        >
          <Stack gap="8">
            {/* Header */}
            <Stack gap="3" textAlign="center">
              <Box
                w="50px"
                h="50px"
                mx="auto"
                bgGradient="linear(to-br, #3B82F6, #06B6D4)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="24px"
                fontWeight="bold"
                color="white"
                mb="2"
                boxShadow="0 4px 20px rgba(6, 182, 212, 0.3)"
              >
                VP
              </Box>
              <Heading size="lg" color="white" fontWeight="700">
                Welcome Back
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Sign in to continue your reading journey
              </Text>
            </Stack>

            {/* Error Message */}
            {error && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                bg="rgba(239, 68, 68, 0.1)"
                border="1px solid rgba(239, 68, 68, 0.2)"
                p="4"
                borderRadius="lg"
              >
                <Text color="red.300" fontSize="sm" fontWeight="500" display="flex" alignItems="center" gap="2">
                  <Box as="span" bg="red.500" w="4px" h="4px" borderRadius="full" />
                  {error}
                </Text>
              </MotionBox>
            )}

            {/* Login Form */}
            <Box as="form" onSubmit={handleLogin}>
              <Stack gap="5">
                {/* Email Field */}
                <Box>
                  <Text fontWeight="600" color="gray.300" mb="2" fontSize="sm">
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{
                      borderColor: 'blue.400',
                      bg: 'rgba(0, 0, 0, 0.3)',
                      boxShadow: '0 0 0 1px #60A5FA'
                    }}
                    _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    borderRadius="xl"
                    required
                  />
                </Box>

                {/* Password Field */}
                <Box>
                  <Text fontWeight="600" color="gray.300" mb="2" fontSize="sm">
                    Password
                  </Text>
                  <Box position="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{
                        borderColor: 'blue.400',
                        bg: 'rgba(0, 0, 0, 0.3)',
                        boxShadow: '0 0 0 1px #60A5FA'
                      }}
                      _hover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      borderRadius="xl"
                      pr="12"
                      required
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      color="gray.400"
                      _hover={{ color: "white", bg: "whiteAlpha.100" }}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </Button>
                  </Box>
                </Box>

                {/* Remember Me & Forgot Password */}
                <Stack direction="row" justify="space-between" width="full" align="center">
                  <Box display="flex" alignItems="center" gap="2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#3B82F6', cursor: 'pointer' }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
                      Remember me
                    </label>
                  </Box>
                  <Link
                    href="/auth/reset-password"
                    fontSize="13px"
                    color="blue.400"
                    fontWeight="600"
                    _hover={{ color: 'blue.300', textDecoration: 'underline' }}
                  >
                    Forgot Password?
                  </Link>
                </Stack>

                {/* Login Button */}
                <Button
                  type="submit"
                  bgGradient="linear(to-r, #3B82F6, #06B6D4)"
                  color="white"
                  size="lg"
                  width="full"
                  disabled={isLoading}
                  fontWeight="700"
                  borderRadius="xl"
                  _hover={{
                    bgGradient: 'linear(to-r, #2563EB, #0891B2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  {isLoading ? 'Processing...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            {/* Divider */}
            <Stack direction="row" width="full" align="center" gap="4">
              <Box height="1px" bg="whiteAlpha.100" flex="1" />
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" textTransform="uppercase" letterSpacing="wider">
                Or continue with
              </Text>
              <Box height="1px" bg="whiteAlpha.100" flex="1" />
            </Stack>

            {/* Google Login */}
            <Button
              variant="outline"
              size="lg"
              width="full"
              borderColor="rgba(255, 255, 255, 0.1)"
              color="white"
              onClick={handleGoogleLogin}
              borderRadius="xl"
              bg="whiteAlpha.50"
              _hover={{
                bg: 'whiteAlpha.100',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Text mr="2">🔐</Text>
              Google
            </Button>

            {/* Sign Up Link */}
            <Stack gap="2" width="full" textAlign="center" pt="2">
              <Text color="gray.400" fontSize="sm">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  color="blue.400"
                  fontWeight="600"
                  _hover={{ color: 'blue.300', textDecoration: 'underline' }}
                >
                  Create Account
                </Link>
              </Text>
            </Stack>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
