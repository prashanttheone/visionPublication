'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login or home after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    alert('🔐 Google signup coming soon - Configure Google OAuth in your application');
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
              📚 Create Account
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Join VisionPub and explore amazing content
            </Text>
          </Stack>

          {/* Error Message */}
          {error && (
            <Box bg="red.50" border="1px solid" borderColor="red.300" p="4" borderRadius="md">
              <Text color="red.700" fontSize="sm" fontWeight="500">
                ❌ {error}
              </Text>
            </Box>
          )}

          {/* Success Message */}
          {success && (
            <Box bg="green.50" border="1px solid" borderColor="green.300" p="4" borderRadius="md">
              <Text color="green.700" fontSize="sm" fontWeight="500">
                ✅ Account created successfully! Please check your email to verify your account.
              </Text>
            </Box>
          )}

          {/* Signup Form */}
          <Box as="form" onSubmit={handleSignup}>
            <Stack gap="5">
              {/* First Name & Last Name */}
              <Stack direction="row" gap="4">
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" mb="2">
                    First Name
                  </Text>
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                    }}
                    required
                  />
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" mb="2">
                    Last Name
                  </Text>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    size="lg"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                    }}
                    required
                  />
                </Box>
              </Stack>

              {/* Email Field */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb="2">
                  Email Address
                </Text>
                <Input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  size="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                  }}
                  required
                />
              </Box>

              {/* Phone Field */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb="2">
                  Phone Number (Optional)
                </Text>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  size="lg"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px rgb(66, 153, 225)'
                  }}
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
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
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
                <Text fontSize="xs" color="gray.500" mt="2">
                  💡 Use at least 8 characters with uppercase, lowercase, and numbers
                </Text>
              </Box>

              {/* Confirm Password Field */}
              <Box>
                <Text fontWeight="bold" color="gray.700" mb="2">
                  Confirm Password
                </Text>
                <Box position="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    position="absolute"
                    right="2"
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </Button>
                </Box>
              </Box>

              {/* Terms & Conditions */}
              <Box>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeToTerms(e.target.checked)}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                    required
                  />
                  <span style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.5' }}>
                    I agree to the{' '}
                    <a href="/terms" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </Box>

              {/* Signup Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                disabled={isLoading}
                fontWeight="bold"
              >
                {isLoading ? '⏳ Creating Account...' : '✨ Create Account'}
              </Button>
            </Stack>
          </Box>

          {/* Divider */}
          <Stack direction="row" width="full" align="center" gap="4">
            <Box height="1px" bg="gray.300" flex="1" />
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              Or sign up with
            </Text>
            <Box height="1px" bg="gray.300" flex="1" />
          </Stack>

          {/* Google Signup */}
          <Button
            variant="outline"
            size="lg"
            width="full"
            borderColor="gray.300"
            onClick={handleGoogleSignup}
            _hover={{
              bg: 'gray.50',
              borderColor: 'gray.400'
            }}
          >
            <Text mr="2">🔐</Text>
            Continue with Google
          </Button>

          {/* Login Link */}
          <Stack gap="2" width="full" textAlign="center">
            <Text color="gray.600" fontSize="sm">
              Already have an account?{' '}
              <Link
                href="/login"
                color="blue.600"
                fontWeight="bold"
                _hover={{ color: 'blue.700', textDecoration: 'underline' }}
              >
                Sign in
              </Link>
            </Text>
          </Stack>

          {/* Footer */}
          <Stack gap="1" width="full" textAlign="center" pt="4" borderTop="1px solid" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500">
              By creating an account, you agree to our terms
            </Text>
          </Stack>
        </Stack>
      </MotionBox>
    </Container>
  );
}
