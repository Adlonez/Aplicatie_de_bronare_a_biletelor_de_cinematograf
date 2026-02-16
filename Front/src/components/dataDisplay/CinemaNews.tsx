import { useState } from "react";
import { Row, Col, Typography, Card, Tag, Space, Button, Divider } from "antd";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import news from "../../_mock/films.json"
import type {NewsItem} from "../../types/ui"


const { Text, Title, Paragraph } = Typography;

const NewsCard: React.FC<{ item: NewsItem; featured?: boolean }> = ({
  item,
  featured = false,
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: featured ? "58%" : "62%",
          overflow: "hidden",
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.45s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 3,
              backdropFilter: "blur(4px)",
            }}
          >
            {item.category}
          </span>
        </div>
      </div>

      <div style={{ paddingTop: 14, flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 8,
          }}
        >
          <CalendarOutlined style={{ fontSize: 11 }} />
          <Text style={{ fontSize: 11, letterSpacing: "0.04em" }}>
            {item.date}
          </Text>
        </div>

        <Text
          strong
          style={{
            fontSize: featured ? 15 : 13,
            lineHeight: 1.4,
            display: "block",
            marginBottom: 8,
            transition: "color 0.2s ease",
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: 12,
            lineHeight: 1.65,
            flex: 1,
          }}
        >
        </Text>

        <div style={{ marginTop: 14 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "gap 0.2s",
            }}
          >
            Read more
            <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Text>
        </div>
      </div>
    </div>
  );
};

const CinemaNews = ({items=[]}:any) => {
  return (
    <div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 4,
                height: 18,
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
              }}
            >
              News &amp; Promotions
            </Text>
          </div>

          <Button
            type="link"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: 0,
              height: "auto",
            }}
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
          >
            All news
          </Button>
        </div>
        <Row gutter={[20, 0]} style={{ height: "100%" }}>
          {items.map((item:any) => (
            <Col key={item.id} xs={24} sm={8} md={8} style={{ height: "100%" }}>
              <div
                style={{
                  height: "100%",
                }}
              >
                <NewsCard item={item} />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default CinemaNews;