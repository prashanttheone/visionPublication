'use client';

import { Box, Container, Text, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, ChangeEvent, FormEvent } from 'react';
import { HiUser, HiPhone, HiAcademicCap, HiDocument, HiCheckCircle } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  bookTitle: string;
  bookDescription: string;
  publishingGoal: string;
}

export default function Invite() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    experience: '',
    bookTitle: '',
    bookDescription: '',
    publishingGoal: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'author',
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          qualification: formData.qualification,
          specialization: formData.specialization,
          experience: formData.experience,
          book_title: formData.bookTitle,
          book_description: formData.bookDescription,
          publishing_goal: formData.publishingGoal,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            qualification: '',
            specialization: '',
            experience: '',
            bookTitle: '',
            bookDescription: '',
            publishingGoal: '',
          });
          setSubmitted(false);
        }, 3000);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const inputStyle = {
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(100, 181, 246, 0.3)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    '&::placeholder': {
      color: 'rgba(148, 163, 184, 0.7)',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#64B5F6',
      boxShadow: '0 0 0 3px rgba(100, 181, 246, 0.1)',
    },
    '&:hover': {
      borderColor: 'rgba(100, 181, 246, 0.5)',
    },
  } as React.CSSProperties;

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)" py={{ base: '60px', md: '80px' }} position="relative" overflow="hidden">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      <Container maxW="900px" px={{ base: '20px', md: '40px' }} position="relative" zIndex={1}>
        {/* Header */}
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center" mb={{ base: '50px', md: '60px' }}>
          <MotionBox variants={itemVariants} mb="20px">
            <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                Author Application
              </Text>
            </Box>
          </MotionBox>

          <MotionBox variants={itemVariants} mb="20px">
            <Text fontSize={{ base: '36px', md: '48px', lg: '56px' }} fontWeight="900" lineHeight="1.2" color="white">
              Start Your Publishing
            </Text>
            <Text fontSize={{ base: '36px', md: '48px', lg: '56px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text">
              Journey Today
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" maxW="700px" mx="auto">
              Complete the form below and our team will review your application. We're excited to learn about your work and discuss how we can help you reach a global audience.
            </Text>
          </MotionBox>
        </MotionBox>

        {/* Form Container */}
        {!submitted ? (
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Box
              bg="rgba(30, 41, 59, 0.6)"
              border="1px solid"
              borderColor="rgba(100, 181, 246, 0.2)"
              borderRadius="20px"
              p={{ base: '32px', md: '48px' }}
              backdropFilter="blur(10px)"
            >
              <form onSubmit={handleSubmit}>
                {/* Section 1: Personal Information */}
                <Box mb="40px">
                  <Text fontSize="18px" fontWeight="800" color="white" mb="24px" display="flex" alignItems="center" gap="10px">
                    <HiUser size={24} color="#FF8C00" />
                    Personal Information
                  </Text>

                  <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="16px" mb="16px">
                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Full Name *
                      </Text>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        style={inputStyle}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Email Address *
                      </Text>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                        style={inputStyle}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Phone Number *
                      </Text>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91-XXXXX-XXXXX"
                        required
                        style={inputStyle}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Qualification *
                      </Text>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., B.Sc Nursing, M.Sc"
                        required
                        style={inputStyle}
                      />
                    </Box>
                  </Box>

                  <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="16px">
                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Specialization *
                      </Text>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Medical-Surgical Nursing"
                        required
                        style={inputStyle}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                        Years of Experience *
                      </Text>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="e.g., 10+ years"
                        required
                        style={inputStyle}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Divider */}
                <Box height="1px" bg="linear-gradient(to-r, transparent, rgba(100, 181, 246, 0.2), transparent)" my="40px" />

                {/* Section 2: Book Details */}
                <Box mb="40px">
                  <Text fontSize="18px" fontWeight="800" color="white" mb="24px" display="flex" alignItems="center" gap="10px">
                    <HiDocument size={24} color="#FF8C00" />
                    Book Details
                  </Text>

                  <Box mb="16px">
                    <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                      Book/Article Title *
                    </Text>
                    <input
                      type="text"
                      name="bookTitle"
                      value={formData.bookTitle}
                      onChange={handleChange}
                      placeholder="Enter the title of your work"
                      required
                      style={inputStyle}
                    />
                  </Box>

                  <Box mb="16px">
                    <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                      Brief Description *
                    </Text>
                    <textarea
                      name="bookDescription"
                      value={formData.bookDescription}
                      onChange={handleChange}
                      placeholder="Provide a brief overview of your work (minimum 50 characters)"
                      required
                      rows={4}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '120px',
                      }}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" color="gray.300" mb="8px">
                      Publishing Goal *
                    </Text>
                    <textarea
                      name="publishingGoal"
                      value={formData.publishingGoal}
                      onChange={handleChange}
                      placeholder="Tell us about your publishing goals and target audience"
                      required
                      rows={4}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '120px',
                      }}
                    />
                  </Box>
                </Box>

                {/* Terms & Submission */}
                <Box>
                  <Box display="flex" gap="12px" mb="24px" alignItems="flex-start">
                    <input type="checkbox" required style={{ marginTop: '6px', cursor: 'pointer' }} />
                    <Text fontSize="sm" color="gray.300">
                      I agree to the terms and conditions and authorize VisionPublications to review my application
                    </Text>
                  </Box>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF8C00, #FFA500)',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)',
                    }}
                  >
                    Submit Application
                  </motion.button>

                  <Text fontSize="xs" color="gray.400" mt="16px" textAlign="center">
                    Our team will review your application and contact you within 5-7 business days.
                  </Text>
                </Box>
              </form>
            </Box>
          </MotionBox>
        ) : (
          /* Success Message */
          <MotionBox
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            textAlign="center"
            bg="rgba(30, 41, 59, 0.6)"
            border="1px solid rgba(74, 222, 128, 0.3)"
            borderRadius="20px"
            p={{ base: '40px', md: '60px' }}
            backdropFilter="blur(10px)"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              <Box mb="24px" display="flex" justifyContent="center">
                <Box
                  bg="linear-gradient(135deg, #4ADE80, #22C55E)"
                  width="80px"
                  height="80px"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <HiCheckCircle size={48} color="white" />
                </Box>
              </Box>
            </motion.div>

            <Text fontSize={{ base: '28px', md: '36px' }} fontWeight="900" color="white" mb="16px">
              Application Received!
            </Text>
            <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" mb="24px">
              Thank you for your interest in publishing with VisionPublications. We've received your application and will review it shortly.
            </Text>
            <Text fontSize="14px" color="gray.400">
              Check your email for updates. We'll be in touch within 5-7 business days.
            </Text>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
