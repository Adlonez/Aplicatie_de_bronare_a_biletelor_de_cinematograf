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
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '30px' }}>
        <FileTextOutlined style={{ marginRight: '10px' }} />
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
                  style={{ 
                    height: '250px', 
                    objectFit: 'cover' 
                  }}
                />
              }
              style={{ height: '100%', cursor: 'pointer' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Tag color="purple">{news.category}</Tag>
                <span style={{ 
                  color: '#60157A', 
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  <CalendarOutlined /> {news.date}
                </span>
              </div>
              
              <Title level={4} style={{ marginBottom: '12px' }}>
                {news.title}
              </Title>
              
              <Paragraph style={{ color: '#ccc' }}>
                {news.content}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              {selectedNews?.title}
            </Title>
            <div>
              <Tag color="purple">{selectedNews?.category}</Tag>
              <span style={{ color: '#60157A', fontSize: '12px', marginLeft: '8px' }}>
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
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {selectedNews.fullContent}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default News;