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
import { FiEye, FiEyeOff } from 'react-icons/fi';

const MotionBox = motion.create(Box);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement login functionality
    setTimeout(() => {
      setIsLoading(false);
      alert('✅ Login functionality coming soon - Configure authentication in your backend');
    }, 1000);
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    alert('🔐 Google login coming soon - Configure Google OAuth in your application');
  };

  return (
    <Container maxW="sm" py={20}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack gap="8">
          {/* Header */}
          <Stack gap="2" textAlign="center">
            <Heading size="lg" color="blue.600">
              📚 Welcome Back
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Sign in to your VisionPub account
            </Text>
          </Stack>

          {/* Login Form */}
          <Box as="form" onSubmit={handleLogin}>
            <Stack gap="5">
              {/* Email Field */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb="2">
                  Email Address
                </Text>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                  }}
                  required
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb="2">
                  Password
                </Text>
                <Box position="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                    }}
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
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </Button>
                </Box>
              </Box>

              {/* Remember Me & Forgot Password */}
              <Stack direction="row" justify="space-between" width="full">
                <Box>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#4a5568', cursor: 'pointer' }}>
                    Remember me
                  </label>
                </Box>
                <Link
                  href="/auth/reset-password"
                  fontSize="sm"
                  color="blue.600"
                  fontWeight="bold"
                  _hover={{ color: 'blue.700', textDecoration: 'underline' }}
                >
                  Forgot Password?
                </Link>
              </Stack>

              {/* Login Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                disabled={isLoading}
                fontWeight="bold"
              >
                {isLoading ? '⏳ Signing in...' : '🔓 Sign In'}
              </Button>
            </Stack>
          </Box>

          {/* Divider */}
          <Stack direction="row" width="full" align="center" gap="4">
            <Box height="1px" bg="gray.300" flex="1" />
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              Or continue with
            </Text>
            <Box height="1px" bg="gray.300" flex="1" />
          </Stack>

          {/* Google Login */}
          <Button
            variant="outline"
            size="lg"
            width="full"
            borderColor="gray.300"
            onClick={handleGoogleLogin}
            _hover={{
              bg: 'gray.50',
              borderColor: 'gray.400'
            }}
          >
            <Text mr="2">🔐</Text>
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <Stack gap="2" width="full" textAlign="center">
            <Text color="gray.600" fontSize="sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                color="blue.600"
                fontWeight="bold"
                _hover={{ color: 'blue.700', textDecoration: 'underline' }}
              >
                Create one
              </Link>
            </Text>
          </Stack>

          {/* Footer */}
          <Stack gap="1" width="full" textAlign="center" pt="4" borderTop="1px solid" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500">
              By signing in, you agree to our
            </Text>
            <Stack direction="row" justify="center" gap="1" fontSize="xs">
              <Link href="/terms" color="blue.600" _hover={{ textDecoration: 'underline' }}>
                Terms of Service
              </Link>
              <Text color="gray.400">•</Text>
              <Link href="/privacy" color="blue.600" _hover={{ textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </MotionBox>
    </Container>
  );
}
