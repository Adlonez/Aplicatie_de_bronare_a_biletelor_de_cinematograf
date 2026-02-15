import { useState } from "react";
import { Button, Typography, Tag, Space, type CarouselProps } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";


const { Text, Title } = Typography;

interface Film {
  id: number;
  title: string;
  poster: string;
  format: "2D" | "3D" | "IMAX";
  languages: string[];
}


const VISIBLE_COUNT = 4;

const FilmCard: React.FC<{ film: Film }> = ({ film }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "150%",
          borderRadius: 8,
          overflow: "hidden",
          background: "#f0f0f0",
        }}
      >
        <img
          src={film.poster}
          alt={film.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.45s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            borderRadius: 8,
          }}
        >
          <Button
            type="primary"
            shape="round"
            danger
            style={{
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0 20px",
              height: 36,
              boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
              border: "none",
              background: "#e31e24",
            }}
          >
            Buy a ticket
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: "0 2px" }}>
        <Text
          strong
          ellipsis
          style={{
            display: "block",
            fontSize: 13,
            color: "#222",
            marginBottom: 5,
            lineHeight: "1.3",
          }}
        >
          {film.title}
        </Text>

        <Space size={2} wrap={false} style={{ display: "flex", alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: "#e31e24" }}>
            {film.format}
          </Text>
          {film.languages.map((lang, i) => (
            <Space key={lang} size={2} style={{ display: "flex", alignItems: "center" }}>
              <Text style={{ color: "#ccc", fontWeight: 300, fontSize: 12 }}>·</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: i === 0 ? "#e31e24" : "#f87171",
                }}
              >
                {lang}
              </Text>
            </Space>
          ))}
        </Space>
      </div>
    </div>
  );
};

type CinemaCarouselProps={
    title:string;
    items:any;

}

const CinemaCarousel = ({title,items=[]}:CinemaCarouselProps) => {
  const [offset, setOffset] = useState<number>(0);

  const maxOffset = items.length - VISIBLE_COUNT;
  const canPrev = offset > 0;
  const canNext = offset < maxOffset;

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  const arrowStyle = (enabled: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "calc(50% - 20px)",
    transform: "translateY(-50%)",
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: `2px solid ${enabled ? "#bbb" : "#e8e8e8"}`,
    background: "#fff",
    boxShadow: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: enabled ? "#555" : "#ccc",
    padding: 0,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "40px 0",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 4,
              height: 18,
              background: "#e31e24",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#333",
            }}
          >
            {title}
          </Text>
        </div>

        <div style={{ position: "relative" }}>
          <Button
            icon={<LeftOutlined />}
            onClick={prev}
            disabled={!canPrev}
            style={{ ...arrowStyle(canPrev), left: -22 }}
          />

          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                transform: `translateX(calc(-${offset} * ((100% + 16px) / ${VISIBLE_COUNT})))`,
                transition: "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {items.map((film:any) => (
                <div
                  key={film.id}
                  style={{
                    flexShrink: 0,
                    width: `calc((100% - ${(VISIBLE_COUNT - 1) * 16}px) / ${VISIBLE_COUNT})`,
                  }}
                >
                  <FilmCard film={film} />
                </div>
              ))}
            </div>
          </div>

          <Button
            icon={<RightOutlined />}
            onClick={next}
            disabled={!canNext}
            style={{ ...arrowStyle(canNext), right: -22 }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 18,
          }}
        >
          {Array.from({ length: maxOffset + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setOffset(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                height: 6,
                width: i === offset ? 20 : 6,
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: i === offset ? "#e31e24" : "#d1d5db",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaCarousel;