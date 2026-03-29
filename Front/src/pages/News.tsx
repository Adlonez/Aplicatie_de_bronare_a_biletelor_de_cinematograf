import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Tag, Modal, Spin, Alert } from 'antd'
import type { NewsItem } from '../types/ui'
import axiosInstance from '../api/axiosInstance'

const { Title, Paragraph } = Typography

const News = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    axiosInstance.get('/api/news/list')
      .then((res) => setNewsData(res.data.data))
      .catch(() => setError('Failed to load news. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedNews(null)
  }

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (error) return <Alert message={error} type="error" style={{ margin: 24 }} />

  useEffect(() => {
    const selectedNewsId = location.state?.selectedNewsId;

    if (!selectedNewsId) {
      return;
    }

    const newsItem = newsData.find((item) => item.id === selectedNewsId);
    if (newsItem) {
      setSelectedNews(newsItem);
      setIsModalOpen(true);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
                  style={{ height: '250px', objectFit: 'cover' }}
                />
              }
              style={{ height: '100%', cursor: 'pointer' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Tag color="purple">{news.category}</Tag>
                <span style={{ color: '#60157A', fontSize: '12px', marginLeft: '8px' }}>
                  <CalendarOutlined /> {news.date}
                </span>
              </div>

              <Title level={4} style={{ marginBottom: '12px' }}>{news.title}</Title>

              <Paragraph style={{ color: '#ccc' }}>{news.content}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <div>
            <Title level={3} style={{ marginBottom: '8px' }}>{selectedNews?.title}</Title>
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
  )
}

export default News;