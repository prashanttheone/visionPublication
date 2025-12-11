'use client';

import { Box, Container, Text, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiSparkles, HiUserGroup, HiLightBulb, HiHeart } from 'react-icons/hi2';
import { HiTrendingUp } from 'react-icons/hi';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

interface TeamMember {
  name: string;
  role: string;
  team: string;
  image: string;
  bio: string;
}

interface StatItem {
  label: string;
  value: string;
  icon: any;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Sharma',
    role: 'Editor-in-Chief',
    team: 'Editorial Team',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: '20+ years in medical publishing',
  },
  {
    name: 'Priya Verma',
    role: 'Senior Editor',
    team: 'Editorial Team',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Expert in health sciences content',
  },
  {
    name: 'Rajesh Design',
    role: 'Creative Director',
    team: 'Design Team',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Award-winning publication design',
  },
  {
    name: 'Sarah Khan',
    role: 'Lead Designer',
    team: 'Design Team',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Specializes in educational materials',
  },
  {
    name: 'Amit Patel',
    role: 'Operations Manager',
    team: 'Publishing & Operations',
    image: 'https://images.unsplash.com/photo-1507527173202-83c92705a63b?w=400&h=400&fit=crop',
    bio: 'Streamlining publishing workflows',
  },
  {
    name: 'Lisa Anderson',
    role: 'Publishing Director',
    team: 'Publishing & Operations',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Leading digital transformation',
  },
  {
    name: 'Dr. Vikram Singh',
    role: 'Chief Executive Officer',
    team: 'Leadership',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Visionary leader in healthcare publishing',
  },
  {
    name: 'Neha Gupta',
    role: 'Chief Operating Officer',
    team: 'Leadership',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Building scalable publishing solutions',
  },
];

const stats: StatItem[] = [
  { label: 'Books Published', value: '500+', icon: HiSparkles },
  { label: 'Happy Readers', value: '100K+', icon: HiHeart },
  { label: 'Expert Authors', value: '200+', icon: HiUserGroup },
  { label: 'Growth Rate', value: '45%', icon: HiTrendingUp },
];

const values = [
  {
    title: 'Excellence',
    description: 'Unwavering commitment to the highest quality in every publication',
  },
  {
    title: 'Innovation',
    description: 'Embracing technology and new approaches in educational publishing',
  },
  {
    title: 'Integrity',
    description: 'Maintaining ethical standards and transparency in all operations',
  },
  {
    title: 'Impact',
    description: 'Creating meaningful change in healthcare education globally',
  },
  {
    title: 'Collaboration',
    description: 'Partnering with experts to deliver comprehensive solutions',
  },
  {
    title: 'Accessibility',
    description: 'Making quality healthcare knowledge available to everyone',
  },
];

export default function About() {
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(100, 181, 246, 0.2)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <Box bg="linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)">
      {/* Background Elements */}
      <Box position="fixed" top="-100px" right="-100px" width="400px" height="400px" borderRadius="50%" bgGradient="radial(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />
      <Box position="fixed" bottom="-50px" left="-50px" width="300px" height="300px" borderRadius="50%" bgGradient="radial(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" zIndex={0} />

      {/* Hero Section */}
      <Box py={{ base: '60px', md: '100px' }} position="relative" zIndex={1}>
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={containerVariants} initial="hidden" animate="visible" textAlign="center">
            <MotionBox variants={itemVariants} mb="20px">
              <Box display="inline-block" bg="rgba(255, 140, 0, 0.1)" border="2px solid" borderColor="rgba(255, 140, 0, 0.5)" px="16px" py="8px" borderRadius="50px">
                <Text fontSize="sm" fontWeight="700" color="#FF8C00" textTransform="uppercase" letterSpacing="1px">
                  About Vision
                </Text>
              </Box>
            </MotionBox>

            <MotionBox variants={itemVariants} mb="30px">
              <Text fontSize={{ base: '42px', md: '56px', lg: '72px' }} fontWeight="900" lineHeight="1.2" color="white" mb="20px">
                Transforming Healthcare
              </Text>
              <Text fontSize={{ base: '42px', md: '56px', lg: '72px' }} fontWeight="900" lineHeight="1.2" bgGradient="linear(to-r, #64B5F6, #90CAF9)" bgClip="text" mb="20px">
                Education Worldwide
              </Text>
            </MotionBox>

            <MotionBox variants={itemVariants} maxW="700px" mx="auto">
              <Text fontSize={{ base: '16px', md: '18px' }} color="gray.300" lineHeight="1.8">
                Since our inception, Vision Health Sciences has been at the forefront of publishing high-quality, evidence-based healthcare education materials that empower students, educators, and professionals globally.
              </Text>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* Who We Are Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <Grid gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: '40px', lg: '60px' }} alignItems="center">
            <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Who We Are
              </Text>
              <Text fontSize={{ base: '32px', md: '42px' }} fontWeight="900" color="white" mb="20px" lineHeight="1.3">
                Pioneers in Healthcare Publishing
              </Text>
              <Text fontSize="md" color="gray.300" lineHeight="1.8" mb="16px">
                Vision Health Sciences is a leading publisher dedicated exclusively to healthcare and allied sciences education. We combine academic rigor with practical relevance to create publications that bridge the gap between theory and clinical practice.
              </Text>
              <Text fontSize="md" color="gray.300" lineHeight="1.8">
                Our team of experienced editors, designers, and publishing professionals works tirelessly to ensure every publication meets the highest standards of quality, accuracy, and educational value.
              </Text>
            </MotionBox>

            <MotionBox variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Box bg="linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="20px" p={{ base: '32px', md: '48px' }} backdropFilter="blur(10px)">
                <Box fontSize="64px" color="#64B5F6" mb="16px">
                  📚
                </Box>
                <Text fontSize="md" color="gray.300" lineHeight="1.8">
                  "Empowering healthcare professionals through quality education and continuous innovation in publishing"
                </Text>
              </Box>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Mission & Philosophy Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} mb="60px">
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Core
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                Mission & Philosophy
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="40px">
            <MotionBox variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box fontSize="40px" mb="16px">
                  🎯
                </Box>
                <Text fontSize="24px" fontWeight="800" color="white" mb="16px">
                  Our Mission
                </Text>
                <Text fontSize="md" color="gray.300" lineHeight="1.8">
                  To publish relevant, timely, and informative healthcare literature that serves the nursing and allied health sciences community, while maintaining unwavering commitment to excellence and continuous improvement in medical education.
                </Text>
              </Box>
            </MotionBox>

            <MotionBox variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                <Box fontSize="40px" mb="16px">
                  💡
                </Box>
                <Text fontSize="24px" fontWeight="800" color="white" mb="16px">
                  Publishing Philosophy
                </Text>
                <Text fontSize="md" color="gray.300" lineHeight="1.8">
                  We believe in creating quality textbooks that are evidence-based, practically applicable, and accessible. Our philosophy centers on bridging academic knowledge with real-world clinical practice to create a better tomorrow through education.
                </Text>
              </Box>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Our Journey
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="30px">
              Our Story & Origin
            </Text>

            <Box display="flex" flexDirection="column" gap="24px">
              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)">
                <Text fontSize="md" color="gray.300" lineHeight="1.9">
                  Founded in 2010 with a vision to revolutionize healthcare education, Vision Health Sciences began as a small team of passionate educators and publishing professionals. Our journey started with a simple belief: quality healthcare education should be accessible, affordable, and practical.
                </Text>
              </Box>

              <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)">
                <Text fontSize="md" color="gray.300" lineHeight="1.9">
                  Over a decade, we've grown from publishing our first nursing textbook to becoming a leading publisher with 500+ titles across healthcare disciplines. Today, our publications are trusted by thousands of students and educators worldwide, making a tangible impact on healthcare education and practice.
                </Text>
              </Box>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* What We Do Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Services
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                What We Do & Our Expertise
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="24px">
            {[
              { icon: '✍️', title: 'Content Development', desc: 'Expert writing and content creation for healthcare publications' },
              { icon: '📐', title: 'Editorial Services', desc: 'Comprehensive editing and quality assurance processes' },
              { icon: '🎨', title: 'Design & Layout', desc: 'Professional design and publication formatting' },
              { icon: '💻', title: 'Digital Publishing', desc: 'E-books and digital-first publishing solutions' },
              { icon: '🔍', title: 'Author Support', desc: 'Complete guidance from manuscript to publication' },
              { icon: '📊', title: 'Distribution', desc: 'Wide distribution through multiple channels' },
            ].map((service, i) => (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="24px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }} height="100%">
                  <Box fontSize="40px" mb="12px">
                    {service.icon}
                  </Box>
                  <Text fontSize="lg" fontWeight="700" color="white" mb="8px">
                    {service.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {service.desc}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Author Support Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Author Partnership
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="30px">
              How We Support Authors
            </Text>

            <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="24px">
              {[
                'Dedicated author liaison and support team',
                'Professional editing and quality assurance',
                'Expert design and layout services',
                'Marketing and promotional support',
                'Royalty structure designed to reward quality',
                'Global distribution and visibility',
              ].map((item, i) => (
                <MotionBox key={i} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box display="flex" gap="16px">
                    <Box color="#64B5F6" mt="2px" flexShrink={0}>
                      <HiCheckCircle size={24} />
                    </Box>
                    <Text fontSize="md" color="gray.300" lineHeight="1.6">
                      {item}
                    </Text>
                  </Box>
                </MotionBox>
              ))}
            </Grid>
          </MotionBox>
        </Container>
      </Box>

      {/* Values Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Principles
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                Core Values That Guide Us
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="24px">
            {values.map((value, i) => (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="28px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }} height="100%">
                  <Text fontSize="lg" fontWeight="800" color="#FF8C00" mb="12px">
                    {value.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400" lineHeight="1.6">
                    {value.description}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Impact
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                By The Numbers
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap="24px">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                  <Box bg="linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(66, 165, 245, 0.05))" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" textAlign="center" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                    <Box fontSize="40px" mb="16px" display="inline-block" color="#64B5F6">
                      <Icon size={40} />
                    </Box>
                    <Text fontSize={{ base: '32px', md: '40px' }} fontWeight="900" color="#FF8C00" mb="8px">
                      {stat.value}
                    </Text>
                    <Text fontSize="sm" color="gray.400" fontWeight="600">
                      {stat.label}
                    </Text>
                  </Box>
                </MotionBox>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Our Team
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="20px">
                Meet Our Leadership & Experts
              </Text>
              <Text fontSize="md" color="gray.300" maxW="600px" mx="auto">
                Experienced professionals dedicated to excellence in healthcare publishing
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="24px">
            {teamMembers.map((member, i) => (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" overflow="hidden" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                  <Box width="100%" height="200px" overflow="hidden" bg="rgba(100, 181, 246, 0.1)">
                    <Box backgroundImage={`url(${member.image})`} backgroundSize="cover" backgroundPosition="center" width="100%" height="100%" />
                  </Box>
                  <Box p="20px">
                    <Text fontSize="lg" fontWeight="700" color="white" mb="4px">
                      {member.name}
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="#FF8C00" mb="4px">
                      {member.role}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mb="8px">
                      {member.team}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {member.bio}
                    </Text>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Editorial Process Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
              Quality Assurance
            </Text>
            <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="40px">
              Our Editorial & Production Process
            </Text>

            <Box display="flex" flexDirection="column" gap="16px">
              {[
                { step: 'Manuscript Submission', desc: 'Initial review and content assessment by editorial team' },
                { step: 'Peer Review', desc: 'Rigorous evaluation by subject matter experts' },
                { step: 'Editing & Revisions', desc: 'Comprehensive editing for clarity, accuracy, and consistency' },
                { step: 'Design & Layout', desc: 'Professional formatting and visual design' },
                { step: 'Proofreading', desc: 'Final quality check for perfection' },
                { step: 'Publication', desc: 'Release across print and digital platforms' },
              ].map((item, i) => (
                <MotionBox key={i} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Box display="flex" gap="16px" alignItems="flex-start">
                    <Box width="32px" height="32px" borderRadius="50%" bg="linear-gradient(135deg, #64B5F6, #42A5F5)" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="700" flexShrink={0}>
                      {i + 1}
                    </Box>
                    <Box>
                      <Text fontSize="md" fontWeight="700" color="white" mb="4px">
                        {item.step}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {item.desc}
                      </Text>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Differentiators Section */}
      <Box py={{ base: '60px', md: '80px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" mb="60px" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants}>
              <Text fontSize="sm" fontWeight="700" color="#FF8C00" mb="12px" textTransform="uppercase" letterSpacing="1px">
                Why Choose Us
              </Text>
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white">
                What Sets Us Apart
              </Text>
            </MotionBox>
          </MotionBox>

          <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="32px">
            {[
              { icon: '🎓', title: 'Academic Excellence', desc: 'Rigorous peer review and expert-authored content' },
              { icon: '🌍', title: 'Global Reach', desc: 'Distributed and trusted by educators worldwide' },
              { icon: '💼', title: 'Industry Expertise', desc: '14+ years of specialized healthcare publishing' },
              { icon: '🚀', title: 'Innovation', desc: 'Pioneering digital and interactive learning solutions' },
              { icon: '💰', title: 'Value for Money', desc: 'Affordable pricing without compromising quality' },
              { icon: '🤝', title: 'Author Focus', desc: 'Dedicated support from conception to publication' },
            ].map((diff, i) => (
              <MotionBox key={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} whileHover="hover">
                <Box bg="rgba(30, 41, 59, 0.6)" border="1px solid" borderColor="rgba(100, 181, 246, 0.2)" borderRadius="16px" p="32px" backdropFilter="blur(10px)" cursor="pointer" transition="all 0.3s ease" _hover={{ borderColor: 'rgba(100, 181, 246, 0.4)' }}>
                  <Box fontSize="48px" mb="16px">
                    {diff.icon}
                  </Box>
                  <Text fontSize="lg" fontWeight="700" color="white" mb="12px">
                    {diff.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {diff.desc}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: '60px', md: '100px' }} position="relative" zIndex={1} borderTop="1px solid" borderColor="rgba(100, 181, 246, 0.1)">
        <Container maxW="1200px" px={{ base: '20px', md: '40px' }}>
          <MotionBox textAlign="center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MotionBox variants={itemVariants} mb="40px">
              <Text fontSize={{ base: '32px', md: '48px' }} fontWeight="900" color="white" mb="20px">
                Ready to Make an Impact?
              </Text>
              <Text fontSize="md" color="gray.300" maxW="600px" mx="auto" mb="40px">
                Join our community of authors, educators, and students transforming healthcare education
              </Text>
            </MotionBox>

            <MotionBox variants={itemVariants} display="flex" gap="20px" justifyContent="center" flexWrap="wrap">
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 140, 0, 0.3)' }} whileTap={{ scale: 0.95 }} style={{ padding: '16px 48px', fontSize: '16px', fontWeight: '600', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255, 140, 0, 0.2)' }}>
                Publish With Us
              </motion.button>

              <motion.button whileHover={{ scale: 1.05, borderColor: '#64B5F6', boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)' }} whileTap={{ scale: 0.95 }} style={{ padding: '16px 48px', fontSize: '16px', fontWeight: '600', border: '2px solid rgba(100, 181, 246, 0.5)', borderRadius: '8px', background: 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                Explore Our Books
              </motion.button>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
}
