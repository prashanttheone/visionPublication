"use client";

import { useState, useEffect } from "react";
import { HiMegaphone, HiSparkles, HiUser, HiLockClosed } from "react-icons/hi2";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { Divider } from "antd";

interface Announcement {
  id: number;
  text: string;
  icon?: "megaphone" | "sparkles";
}

const announcements: Announcement[] = [
  {
    id: 1,
    text: "🎉 Special Offer: Get 20% OFF on all Healthcare Books!",
    icon: "sparkles",
  },
  {
    id: 2,
    text: "📚 New Arrivals: Latest Nursing & Medical Textbooks Available Now",
    icon: "megaphone",
  },
  {
    id: 3,
    text: "🚚 Free Shipping on Orders Above ₹500",
    icon: "sparkles",
  },
  {
    id: 4,
    text: "⭐ Join 1,000+ Healthcare Professionals - Shop with VisionPublication",
    icon: "megaphone",
  },
];

export default function AnnouncementBar() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getIcon = (iconType?: string) => {
    if (iconType === "megaphone") {
      return <HiMegaphone className="w-4 h-4" />;
    } else if (iconType === "sparkles") {
      return <HiSparkles className="w-4 h-4" />;
    }
    return null;
  };

  if (!isMounted) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 py-2.5 border-b-2 border-white/30 z-[100] h-[45px]"></div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 py-2.5 border-b-2 border-white/30 z-[100]">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)",
        }}
      />

      <div className="flex items-center justify-between px-4">
        {/* Marquee Container - 60% width */}
        <div className="w-[45%]  overflow-hidden relative lg:w-[75%]">
          <div className="animate-marquee flex gap-[60px] whitespace-nowrap">
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
          </div>

          {/* Gradient Fade on Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-orange-600 to-transparent pointer-events-none z-[1]" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-orange-600 to-transparent pointer-events-none z-[1]" />
        </div>

        {/* Static Icons Container - 40% width */}
        <div className="w-[45%] flex items-center justify-end gap-6   lg:w-[20%]">
          {/* Auth Icons */}
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-white mx-3" />
            <button
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
              onClick={() => router.push("/login")}
              aria-label="Login"
            >
              <span className="inline-flex items-center gap-2">
                Login
                <HiUser className="w-4 h-4 text-white" />
              </span>
            </button>
            <div className="w-px h-6 bg-white mx-3" />
            {/*             
            <button 
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
              onClick={() => router.push('/signup')}
              aria-label="Sign Up"
            >
              <HiLockClosed className="w-4 h-4 text-white" />
            </button> */}
          </div>

          {/* Social Media Icons */}
          <div
            className="flex items-center px-4 gap-6 "
            style={{ marginRight: "16px", padding: "4px" }}
          >
            <a
              href="https://www.facebook.com/share/171jx1Lu7k/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://www.instagram.com/visionhealthsciences?igsh=N3FucmhycXJ1OXJx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://www.youtube.com/@VISIONHEALTHSCIENCESPUBLISHERS"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://www.linkedin.com/in/vision-health-sciences-publishers-03617b310/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
