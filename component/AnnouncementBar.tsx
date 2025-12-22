'use client';

import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HiMegaphone, HiSparkles } from 'react-icons/hi2';

const MotionBox = motion.create(Box);

interface Announcement {
  id: number;
  text: string;
  icon?: 'megaphone' | 'sparkles';
}

const announcements: Announcement[] = [
  {
    id: 1,
    text: '🎉 Special Offer: Get 20% OFF on all Healthcare Books!',
    icon: 'sparkles',
  },
  {
    id: 2,
    text: '📚 New Arrivals: Latest Nursing & Medical Textbooks Available Now',
    icon: 'megaphone',
  },
  {
    id: 3,
    text: '🚚 Free Shipping on Orders Above ₹500',
    icon: 'sparkles',
  },
  {
    id: 4,
    text: '⭐ Join 1,000+ Healthcare Professionals - Shop with VisionPublication',
    icon: 'megaphone',
  },
];

export default function AnnouncementBar() {
  const getIcon = (iconType?: string) => {
    if (iconType === 'megaphone') {
      return <HiMegaphone size={16} />;
    } else if (iconType === 'sparkles') {
      return <HiSparkles size={16} />;
    }
    return null;
  };

  return (
    <Box
      bg="linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)"
      position="relative"
      overflow="hidden"
      py="10px"
      borderBottom="2px solid"
      borderColor="rgba(255, 255, 255, 0.3)"
      zIndex={100}
    >
      {/* Animated Background Pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        background="repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)"
        pointerEvents="none"
      />

      {/* Marquee Container */}
      <Box position="relative" overflow="hidden">
        <MotionBox
          display="flex"
          gap="60px"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
          whiteSpace="nowrap"
        >
          {/* Render announcements twice for seamless loop */}
          {[...announcements, ...announcements].map((announcement, index) => (
            <Box
              key={`${announcement.id}-${index}`}
              display="flex"
              alignItems="center"
              gap="8px"
              color="white"
            >
              {/* Icon */}
              {getIcon(announcement.icon)}

              {/* Text */}
              <Text
                fontSize={{ base: '13px', md: '14px' }}
                fontWeight="600"
                letterSpacing="0.3px"
              >
                {announcement.text}
              </Text>

              {/* Separator */}
              <Box
                w="6px"
                h="6px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.5)"
                ml="52px"
              />
            </Box>
          ))}
        </MotionBox>
      </Box>

      {/* Gradient Fade on Edges */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient="linear(to-r, rgba(255, 140, 0, 1), transparent)"
        pointerEvents="none"
        zIndex={1}
      />
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient="linear(to-l, rgba(255, 140, 0, 1), transparent)"
        pointerEvents="none"
        zIndex={1}
      />
    </Box>
  );
}
