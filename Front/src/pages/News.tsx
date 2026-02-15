import { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Modal } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import newsDataJson from '../_mock/news.json';

const { Title, Paragraph } = Typography;

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  content: string;
  image: string;
  fullContent: string;
}

const newsData: NewsItem[] = newsDataJson as NewsItem[];

const News = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <div>
      <Title level={2}>
        <FileTextOutlined />
        Latest News & Updates
      </Title>
      
      <Row gutter={[24, 24]}>
        {newsData.map((news) => (
          <Col xs={24} sm={24} md={12} lg={12} key={news.id}>
            <Card
              hoverable
              onClick={() => handleNewsClick(news)}
              cover={
                <img
                  alt={news.title}
                  src={news.image}
                />
              }
            >
              <div>
                <Tag>{news.category}</Tag>
                <span>
                  <CalendarOutlined /> {news.date}
                </span>
              </div>
              
              <Title level={4}>
                {news.title}
              </Title>
              
              <Paragraph>
                {news.content}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <div>
            <Title level={3}>
              {selectedNews?.title}
            </Title>
            <div>
              <Tag>{selectedNews?.category}</Tag>
              <span>
                <CalendarOutlined /> {selectedNews?.date}
              </span>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        {selectedNews && (
          <div>
            <img
              alt={selectedNews.title}
              src={selectedNews.image}
            />
            <Paragraph>
              {selectedNews.fullContent}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default News;