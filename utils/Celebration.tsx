"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Fireworks } from "fireworks-js";

const Celebration = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fireworksInstanceRef = useRef<Fireworks | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleClose = useCallback(() => {
    if (fireworksInstanceRef.current) {
      fireworksInstanceRef.current.stop();
      fireworksInstanceRef.current = null;
    }
    setIsVisible(false);
  }, []);

  // Check mount status
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Main effect - only run after component is mounted
  useEffect(() => {
    if (!isMounted) return;

    // Check if celebration was already shown in this session
    const hasShown = sessionStorage.getItem("christmasCelebrationShown");
    
    if (hasShown) {
      return;
    }

    // Mark as shown
    sessionStorage.setItem("christmasCelebrationShown", "true");
    setIsVisible(true);

    // Show text after delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 300);

    // Auto close after 8 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(closeTimer);
    };
  }, [isMounted, handleClose]);

  // Initialize fireworks when visible
  useEffect(() => {
    if (!isVisible || !canvasContainerRef.current) return;

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (canvasContainerRef.current && !fireworksInstanceRef.current) {
        const fireworks = new Fireworks(canvasContainerRef.current, {
          autoresize: true,
          opacity: 1,
          acceleration: 1.02,
          friction: 0.97,
          gravity: 1.5,
          particles: 100,
          traceLength: 3,
          traceSpeed: 10,
          explosion: 6,
          intensity: 30,
          flickering: 50,
          lineStyle: "round",
          hue: {
            min: 0,
            max: 360,
          },
          delay: {
            min: 20,
            max: 50,
          },
          rocketsPoint: {
            min: 25,
            max: 75,
          },
          lineWidth: {
            explosion: {
              min: 1,
              max: 3,
            },
            trace: {
              min: 1,
              max: 2,
            },
          },
          brightness: {
            min: 50,
            max: 80,
          },
          decay: {
            min: 0.015,
            max: 0.03,
          },
          mouse: {
            click: false,
            move: false,
            max: 1,
          },
        });

        fireworksInstanceRef.current = fireworks;
        fireworks.start();
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (fireworksInstanceRef.current) {
        fireworksInstanceRef.current.stop();
        fireworksInstanceRef.current = null;
      }
    };
  }, [isVisible]);

  if (!isMounted || !isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Fireworks Canvas Container */}
      <div
        ref={canvasContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />

      {/* Text Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "20px",
          opacity: showText ? 1 : 0,
          transform: showText ? "scale(1)" : "scale(0.5)",
          transition: "all 0.8s ease-out",
        }}
      >
        {/* Main Christmas Text */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 8vw, 7rem)",
            fontWeight: 900,
            marginBottom: "20px",
            background: "linear-gradient(135deg, #ff0000, #ff4444, #ffaa00, #ffdd00, #ff4444, #ff0000)",
            backgroundSize: "300% 300%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradientMove 3s ease infinite",
            textShadow: "0 0 60px rgba(255, 100, 0, 0.8)",
            filter: "drop-shadow(0 0 30px rgba(255, 140, 0, 1))",
          }}
        >
          Merry Christmas
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(100, 181, 246, 0.6)",
            marginBottom: "30px",
          }}
        >
          & Happy New Year 2025!
        </p>

        {/* Decorative Elements */}
        <div
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            animation: "bounce 1s ease-in-out infinite",
          }}
        >
          <span>❄️</span>
          <span>🎄</span>
          <span>🎅</span>
          <span>🎁</span>
          <span>⭐</span>
        </div>

        {/* Wish Message */}
        <p
          style={{
            marginTop: "30px",
            fontSize: "1.2rem",
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 500,
          }}
        >
          Wishing you joy, peace, and prosperity!
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "rgba(255, 140, 0, 0.4)",
          border: "2px solid rgba(255, 140, 0, 0.8)",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, background 0.2s",
          boxShadow: "0 0 25px rgba(255, 140, 0, 0.6)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ✕
      </button>

      {/* Skip Hint */}
      <p
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "14px",
          zIndex: 100,
        }}
      >
        Click ✕ or wait to continue...
      </p>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default Celebration;
