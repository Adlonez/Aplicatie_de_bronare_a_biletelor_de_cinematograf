import { Card, Row, Col, Typography, Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import filmsData from '../_mock/films.json';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const Films = () => {
  const navigate = useNavigate();

  const handleMovieClick = (filmId: number) => {
    navigate(`/films/${filmId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ color: '#fff', marginBottom: '30px' }}>
        Available Movies
      </Title>
      
      <Row gutter={[24, 24]}>
        {filmsData.map((film) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={film.id}>
            <Card
              hoverable
              onClick={() => handleMovieClick(film.id)}
              style={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              bodyStyle={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column' 
              }}
              cover={
                <img
                  alt={film.title}
                  src={film.image}
                  style={{ 
                    height: '300px', 
                    objectFit: 'cover' 
                  }}
                />
              }
            >
              <Meta
                title={
                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {film.title}
                    </Title>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#7c3aed',
                      fontWeight: 'bold'
                    }}>
                      {film.subtitle}
                    </span>
                  </div>
                }
                description={
                  <Paragraph 
                    ellipsis={{ rows: 3 }}
                    style={{ marginTop: '10px' }}
                  >
                    {film.description}
                  </Paragraph>
                }
              />
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                style={{ marginTop: 'auto' }}
                block
                onClick={(e) => {
                  e.stopPropagation();
                  handleMovieClick(film.id);
                }}
              >
                Book Now
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Films;