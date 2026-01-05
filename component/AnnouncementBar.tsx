'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiMegaphone, HiSparkles } from 'react-icons/hi2';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getIcon = (iconType?: string) => {
    if (iconType === 'megaphone') {
      return <HiMegaphone className="w-4 h-4" />;
    } else if (iconType === 'sparkles') {
      return <HiSparkles className="w-4 h-4" />;
    }
    return null;
  };

  // Ensure server and client render the same basic structure
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 py-2.5 border-b-2 border-white/30 z-[100]">
      {/* Animated Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)'
        }}
      />

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {isMounted ? (
          <motion.div
            className="flex gap-[60px] whitespace-nowrap"
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
          >
            {/* Render announcements twice for seamless loop */}
            {[...announcements, ...announcements].map((announcement, index) => (
              <div
                key={`${announcement.id}-${index}`}
                className="flex items-center gap-2 text-white"
              >
                {getIcon(announcement.icon)}
                <span className="text-[13px] md:text-sm font-semibold tracking-wide">
                  {announcement.text}
                </span>
                {/* Separator */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 ml-[52px]" />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex gap-[60px] whitespace-nowrap opacity-0">
             {/* Placeholder for server render to maintain height/structure */}
             <div className="flex items-center gap-2 text-white">
                <span className="text-[13px] md:text-sm font-semibold tracking-wide">
                  {announcements[0].text}
                </span>
             </div>
          </div>
        )}
      </div>

      {/* Gradient Fade on Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-orange-600 to-transparent pointer-events-none z-[1]" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-orange-600 to-transparent pointer-events-none z-[1]" />
    </div>
  );
}
