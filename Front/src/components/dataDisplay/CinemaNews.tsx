import { Row, Col, Typography, Button } from "antd";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { NewsItem } from "../../types/ui";

const { Text } = Typography;

const NewsCard: React.FC<{
  item: NewsItem;
  onReadMore: (newsId: number) => void;
}> = ({ item, onReadMore }) => {
  return (
    <div className="news-card" onClick={() => onReadMore(item.id)}>
      <div className="news-card-image" style={{ aspectRatio: "16 / 10" }}>
        <img src={item.image} alt={item.title} />
        <span className="news-category">{item.category}</span>
      </div>

      <div className="news-card-body">
        <div className="news-date">
          <CalendarOutlined />
          <span>{item.date}</span>
        </div>
        <Text className="news-title">{item.title}</Text>
        <Text style={{ display: "block", marginTop: 10 }} type="secondary">
          {item.content}
        </Text>
        <span className="news-link">
          Read more
          <ArrowRightOutlined />
        </span>
      </div>
    </div>
  );
};

type CinemaNewsProps = {
  items?: NewsItem[];
};

const CinemaNews = ({ items = [] }: CinemaNewsProps) => {
  const navigate = useNavigate();

  const handleReadMore = (newsId: number) => {
    navigate("/news", { state: { selectedNewsId: newsId } });
  };

  return (
    <div className="cinema-section-inner">
      <div className="cinema-section-header">
        <div>
          <div className="cinema-section-kicker">Offers and stories</div>
          <h2 className="cinema-section-title">News & Promotions</h2>
        </div>

        <Button onClick={() => navigate("/news")} icon={<ArrowRightOutlined />}>
          All news
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="cinema-empty-state">No news items are available yet.</div>
      ) : (
        <Row gutter={[24, 28]}>
          {items.map((item: NewsItem) => (
            <Col key={item.id} xs={24} sm={8}>
              <NewsCard item={item} onReadMore={handleReadMore} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CinemaNews;
