import React, { useState } from "react";
import { Button, Carousel } from "antd";
import { PlayCircleOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { CarouselRef } from "antd/es/carousel";
import type { Films } from "../../types/ui";

interface SlideItemProps {
  slide: Films;
  onNavigate: (id: number) => void;
  onBook: (slide: Films) => void;
}

const SlideItem: React.FC<SlideItemProps> = ({ slide, onNavigate, onBook }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`hero-slide ${hovered ? "is-hovered" : ""}`}
      onClick={() => onNavigate(slide.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="link"
      tabIndex={0}
      aria-label={`Go to ${slide.title}`}
      onKeyDown={(event) => event.key === "Enter" && onNavigate(slide.id)}
    >
      <img
        className="hero-slide-image"
        src={slide.poster}
        alt={slide.title}
        draggable={false}
      />

      <div className="hero-content">
        <div className="hero-copy">
          <div className="hero-badges">
            {slide.genre && <span className="cinema-pill">{slide.genre}</span>}
            <span className="cinema-pill">{slide.format}</span>
            <span className="cinema-pill">{slide.languages.join(", ")}</span>
          </div>

          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-description">{slide.description}</p>

          <div className="hero-actions">
            <Button
              type="primary"
              size="large"
              onClick={(event) => {
                event.stopPropagation();
                onBook(slide);
              }}
            >
              Book tickets
            </Button>
            <Button
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                onNavigate(slide.id);
              }}
            >
              Watch trailer
            </Button>
          </div>
        </div>

        <div className="hero-poster-wrap">
          <div className="hero-poster">
            <img src={slide.image} alt={`${slide.title} poster`} draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface BannerCarouselItemsProps {
  slides: Films[];
}

const BannerCarousel: React.FC<BannerCarouselItemsProps> = ({ slides }) => {
  const navigate = useNavigate();
  const carouselRef = React.useRef<CarouselRef>(null);
  const isDragging = React.useRef(false);

  const handleMouseDown = () => {
    isDragging.current = false;
  };

  const handleMouseMove = () => {
    isDragging.current = true;
  };

  const handleNavigate = (id: number) => {
    if (!isDragging.current) {
      navigate(`/films/${id}`);
    }
  };

  const handleBook = (slide: Films) => {
    navigate(`/films/${slide.id}`, {
      state: {
        movie: slide,
      },
    });
  };

  if (slides.length === 0) {
    return (
      <section className="hero-carousel">
        <div className="hero-slide">
          <div className="hero-content">
            <div className="hero-copy">
              <div className="hero-badges">
                <span className="cinema-pill">CinemaUTM</span>
                <span className="cinema-pill">Premieres</span>
              </div>
              <h1 className="hero-title">Movies feel better on the big screen.</h1>
              <p className="hero-description">
                Browse the current schedule, pick your seats, and plan your next cinema night.
              </p>
              <div className="hero-actions">
                <Button type="primary" size="large" onClick={() => navigate("/films")}>
                  Browse films
                </Button>
                <Button size="large" icon={<RightOutlined />} onClick={() => navigate("/news")}>
                  Latest news
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className="hero-carousel"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <Carousel
        ref={carouselRef}
        autoplay
        autoplaySpeed={5000}
        dots={{ className: "hero-dots" }}
        draggable
        effect="scrollx"
      >
        {slides.map((slide) => (
          <SlideItem
            key={slide.id}
            slide={slide}
            onNavigate={handleNavigate}
            onBook={handleBook}
          />
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
