import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Row, Col, Space, Tag, Divider, message } from 'antd';
import { PlayCircleOutlined, ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import filmsData from '../_mock/films.json';

const { Title, Paragraph } = Typography;

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  
  const movie = filmsData.find(film => film.id === Number(id));

  const handleBuyTickets = () => {
    if (!selectedTime) {
      message.warning('Please select a showtime first');
      return;
    }
    navigate(`/films/${id}/book`, { state: { movie, time: selectedTime } });
  };

  const handleAddToWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    if (!isInWatchlist) {
      message.success(`${movie?.title} added to your watchlist!`);
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      if (!watchlist.includes(movie?.id)) {
        watchlist.push(movie?.id);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
      }
    } else {
      message.info(`${movie?.title} removed from your watchlist`);
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      const filtered = watchlist.filter((movieId: number) => movieId !== movie?.id);
      localStorage.setItem('watchlist', JSON.stringify(filtered));
    }
  };

  if (!movie) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Title level={2}>Movie not found</Title>
        <Button type="primary" onClick={() => navigate('/films')}>
          Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/films')}
        style={{ marginBottom: '20px' }}
      >
        Back to Movies
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={10}>
          <Card
            cover={
              <img
                alt={movie.title}
                src={movie.image}
                style={{ 
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            }
            style={{ border: 'none' }}
          />
        </Col>

        <Col xs={24} md={14}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={1} style={{ marginBottom: '8px' }}>
                {movie.title}
              </Title>
              <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
              </Tag>
            </div>

            <Divider style={{ borderColor: '#434343' }} />

            <div>
              <Title level={4}>
                Description
              </Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8'}}>
                {movie.description}
              </Paragraph>
            </div>

            <div>
              <Title level={4}>
                Showtimes
              </Title>
              <Space wrap>
                <Button 
                  icon={<ClockCircleOutlined />}
                  type={selectedTime === '10:00 AM' ? 'primary' : 'default'}
                  onClick={() => setSelectedTime('10:00 AM')}
                >
                  10:00 AM
                </Button>
                <Button 
                  icon={<ClockCircleOutlined />}
                  type={selectedTime === '1:30 PM' ? 'primary' : 'default'}
                  onClick={() => setSelectedTime('1:30 PM')}
                >
                  1:30 PM
                </Button>
                <Button 
                  icon={<ClockCircleOutlined />}
                  type={selectedTime === '4:00 PM' ? 'primary' : 'default'}
                  onClick={() => setSelectedTime('4:00 PM')}
                >
                  4:00 PM
                </Button>
                <Button 
                  icon={<ClockCircleOutlined />}
                  type={selectedTime === '7:30 PM' ? 'primary' : 'default'}
                  onClick={() => setSelectedTime('7:30 PM')}
                >
                  7:30 PM
                </Button>
                <Button 
                  icon={<ClockCircleOutlined />}
                  type={selectedTime === '10:00 PM' ? 'primary' : 'default'}
                  onClick={() => setSelectedTime('10:00 PM')}
                >
                  10:00 PM
                </Button>
              </Space>
            </div>

            <Divider style={{ borderColor: '#434343' }} />

            <Space size="middle" style={{ width: '100%' }} direction="vertical">
              <Button 
                type="primary" 
                size="large"
                icon={<PlayCircleOutlined />}
                block
                onClick={handleBuyTickets}
                style={{ height: '50px', fontSize: '16px' }}
              >
                Buy Tickets Now
              </Button>
              <Button 
                size="large"
                icon={<CalendarOutlined />}
                block
                onClick={handleAddToWatchlist}
                type={isInWatchlist ? 'default' : 'dashed'}
                style={{ height: '50px', fontSize: '16px' }}
              >
                {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default MovieDetail;
