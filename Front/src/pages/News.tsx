import { Card, Row, Col, Typography, Tag } from 'antd';
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
}

const newsData: NewsItem[] = newsDataJson as NewsItem[];

const News = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ color: '#fff', marginBottom: '30px' }}>
        <FileTextOutlined style={{ marginRight: '10px' }} />
        Latest News & Updates
      </Title>
      
      <Row gutter={[24, 24]}>
        {newsData.map((news) => (
          <Col xs={24} sm={24} md={12} lg={12} key={news.id}>
            <Card
              hoverable
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
              style={{ height: '100%' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Tag color="purple">{news.category}</Tag>
                <span style={{ 
                  color: '#999', 
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
    </div>
  );
};

export default News;