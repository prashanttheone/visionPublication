"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop",
    title: "Academic Excellence",
    description: "Dive deep into our curated academic collection.",
  },
  {
    src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
    title: "Library Treasures",
    description: "Discover hidden gems in our extensive library.",
  },
  {
    src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
    title: "Focused Learning",
    description: "Resources designed for competitive success.",
  },
  {
    src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop",
    title: "Expert Authors",
    description: "Content crafted by industry-leading professionals.",
  },
  {
    src: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop",
    title: "New Releases",
    description: "Stay ahead with our latest publications.",
  },
  {
    src: "https://images.unsplash.com/photo-1532012197367-6849f9ec3352?q=80&w=1200&auto=format&fit=crop",
    title: "Research Guides",
    description: "Tools to support your research journey.",
  },
];

const Gallery = () => {
  const [index, setIndex] = useState(-1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section style={{ padding: "80px 20px", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", marginBottom: "16px" }}>
            Our <span style={{ color: "#ea580c" }}>Gallery</span>
          </h2>
          <p style={{ fontSize: "1.25rem", color: "#4b5563", maxWidth: "600px", margin: "0 auto" }}>
            Explore our journey and the impact of Vision Publication.
          </p>
        </div>

        {/* Carousel Section */}
        <div style={{ marginBottom: "80px" }}>
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            style={{ width: "100%", padding: "48px 0" }}
          >
            {galleryImages.map((image, idx) => (
              <SwiperSlide 
                key={idx} 
                style={{ 
                    width: "auto", 
                    maxWidth: "600px",
                    height: "400px" 
                }}
              >
                <div 
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    cursor: "pointer"
                  }}
                  onClick={() => setIndex(idx)}
                >
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <p style={{ color: "white", fontWeight: "600", fontSize: "1.125rem" }}>View Full Image</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Cards Section */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "32px" 
        }}>
          {galleryImages.map((image, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: hoveredCard === idx ? "0 25px 50px -12px rgb(0 0 0 / 0.25)" : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transform: hoveredCard === idx ? "translateY(-8px)" : "none"
              }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setIndex(idx)}
            >
              <div style={{ position: "relative", height: "256px", width: "100%" }}>
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{image.title}</h3>
                <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Popup */}
        <Lightbox
          index={index}
          open={index >= 0}
          close={() => setIndex(-1)}
          slides={galleryImages.map((img) => ({ src: img.src }))}
        />
      </div>
    </section>
  );
};

export default Gallery;
