import React, { useState } from "react";
import { Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import type { CarouselRef } from "antd/es/carousel";
import type {Films} from "../../types/ui"
interface SlideItemProps {
  slide: Films;
  onNavigate: (href: string) => void;
}

const SlideItem: React.FC<SlideItemProps> = ({ slide, onNavigate }) => {
  const [hovered, setHovered] = useState(false);
   
  return (
    <div
      onClick={() => onNavigate(slide.href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="link"
      tabIndex={0}
      aria-label={`Go to ${slide.title}`}
      onKeyDown={(e) => e.key === "Enter" && onNavigate(slide.href)}
      style={{
        position: "relative",
        height: 520,
        cursor: "pointer",
        overflow: "hidden",
        userSelect: "none",
        background: "#1c0a00",
      }}
    >
      <img
        src={slide.poster}
        alt={slide.title}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: hovered ? "scale(1.07)" : "scale(1.0)",
          transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
          opacity:0.65,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "48px 60px",
        }}
      >
        <div
          style={{
            width: hovered ? 80 : 40,
            height: 3,
            background: "#ffffff",
            marginBottom: 20,
            transition: "width 0.4s ease",
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 52,
            fontWeight: 900,
            lineHeight: 1.05,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          {slide.title}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: 16,
            color: "#ffffff",
            maxWidth: 400,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          {slide.description}
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 28px",
            border: `1.5px solid ${"#ffffff"}`,
            color: "#ffffff",
            fontSize: 13,
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: hovered ? `${"#ffffff"}22` : "transparent",
            transition: "background 0.3s ease",
          }}
        >
          Explore
          <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>
    </div>
  );
};

interface BannerCarouselItemsProps {
  slides: Films[];
}

const BannerCarousel: React.FC<BannerCarouselItemsProps> = ({slides}) => {
  const navigate = useNavigate();
  const carouselRef = React.useRef<CarouselRef>(null);
  const isDragging = React.useRef(false);

  const handleMouseDown = () => {
    isDragging.current = false;
  };

  const handleMouseMove = () => {
    isDragging.current = true;
  };

  const handleNavigate = (href: string) => {
    if (!isDragging.current) {
      navigate(href);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      style={{ position: "relative" }}
    >
      <Carousel
        ref={carouselRef}
        autoplay
        autoplaySpeed={5000}
        dots={{ className: "custom-dots" }}
        draggable
        effect="scrollx"
      >
        {slides.map((slide) => (
          <SlideItem
            key={slide.id}
            slide={slide}
            onNavigate={handleNavigate}
          />
        ))}
      </Carousel>

      <style>{`
        .custom-dots {
          bottom: 24px !important;
        }
        .custom-dots li button {
          background: rgba(255, 255, 255, 0.35) !important;
          border-radius: 2px !important;
          width: 24px !important;
          height: 3px !important;
        }
        .custom-dots li.slick-active button {
          background: #ffffff !important;
          width: 48px !important;
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;