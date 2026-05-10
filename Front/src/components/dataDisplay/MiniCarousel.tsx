import { useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { LeftOutlined, RightOutlined, StarFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Films } from "../../types/ui";

const { Text } = Typography;

const ITEM_GAP = 22;

const getVisibleCount = () => {
  if (typeof window === "undefined") return 5;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 860) return 2;
  if (window.innerWidth < 1100) return 4;
  return 5;
};

const FilmCard: React.FC<{
  film: Films;
  onBuyTicket: (film: Films) => void;
}> = ({ film, onBuyTicket }) => {
  const navigate = useNavigate();

  return (
    <div className="movie-card" onClick={() => navigate(`/films/${film.id}`)}>
      <div className="movie-poster">
        <img src={film.image} alt={film.title} />
        <span className="movie-rating">
          <StarFilled />
          4.8
        </span>
        <div className="movie-card-overlay">
          <Button
            type="primary"
            onClick={(event) => {
              event.stopPropagation();
              onBuyTicket(film);
            }}
          >
            Buy ticket
          </Button>
        </div>
      </div>

      <div className="movie-card-body">
        <Text className="movie-title" ellipsis>
          {film.title}
        </Text>
        <div className="movie-meta">
          {film.format}
          {film.genre ? ` | ${film.genre}` : ""}
        </div>
        <div className="movie-languages">{film.languages.join(", ")}</div>
      </div>
    </div>
  );
};

type CinemaCarouselProps = {
  title: string;
  items: Films[];
};

const CinemaCarousel = ({ title, items = [] }: CinemaCarouselProps) => {
  const [offset, setOffset] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(getVisibleCount);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
      setOffset((current) => Math.min(current, Math.max(0, items.length - getVisibleCount())));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items.length]);

  const maxOffset = Math.max(0, items.length - visibleCount);
  const canPrev = offset > 0;
  const canNext = offset < maxOffset;
  const itemWidth = `calc((100% - ${(visibleCount - 1) * ITEM_GAP}px) / ${visibleCount})`;

  const prev = () => setOffset((current) => Math.max(0, current - 1));
  const next = () => setOffset((current) => Math.min(maxOffset, current + 1));
  const handleBuyTicket = (film: Films) => {
    navigate(`/films/${film.id}`, {
      state: {
        movie: film,
      },
    });
  };

  return (
    <div className="cinema-section-inner">
      <div className="cinema-section-header">
        <div>
          <div className="cinema-section-kicker">Cinema schedule</div>
          <h2 className="cinema-section-title">{title}</h2>
        </div>
        <Button onClick={() => navigate("/films")} icon={<RightOutlined />} iconPosition="end">
          View all
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="cinema-empty-state">No movies are available in this section yet.</div>
      ) : (
        <div className="movie-carousel-shell">
          <Button
            className="carousel-arrow carousel-arrow-prev"
            icon={<LeftOutlined />}
            onClick={prev}
            disabled={!canPrev}
            aria-label={`Previous ${title} movies`}
          />

          <div className="movie-carousel-track-window">
            <div
              className="movie-carousel-track"
              style={{
                transform: `translateX(calc(-${offset} * (${itemWidth} + ${ITEM_GAP}px)))`,
              }}
            >
              {items.map((film: Films) => (
                <div
                  className="movie-carousel-item"
                  key={film.id}
                  style={{ width: itemWidth }}
                >
                  <FilmCard film={film} onBuyTicket={handleBuyTicket} />
                </div>
              ))}
            </div>
          </div>

          <Button
            className="carousel-arrow carousel-arrow-next"
            icon={<RightOutlined />}
            onClick={next}
            disabled={!canNext}
            aria-label={`Next ${title} movies`}
          />

          <div className="carousel-progress">
            {Array.from({ length: maxOffset + 1 }).map((_, index) => (
              <button
                key={index}
                className={index === offset ? "is-active" : undefined}
                type="button"
                onClick={() => setOffset(index)}
                aria-label={`Go to ${title} slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaCarousel;
