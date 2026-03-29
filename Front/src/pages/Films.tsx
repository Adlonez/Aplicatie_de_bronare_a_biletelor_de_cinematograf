import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Button, Spin, Alert } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Films as FilmType } from '../types/ui'
import axiosInstance from '../api/axiosInstance'

const { Title, Paragraph } = Typography
const { Meta } = Card

const Films = () => {
  const navigate = useNavigate()
  const [films, setFilms] = useState<FilmType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axiosInstance.get('/api/films/list')
      .then((res) => setFilms(res.data.data))
      .catch(() => setError('Failed to load films. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const handleMovieClick = (filmId: number) => {
    navigate(`/films/${filmId}`)
  }

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (error) return <Alert message={error} type="error" style={{ margin: 24 }} />

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '30px' }}>
        Available Movies
      </Title>

      <Row gutter={[24, 24]}>
        {films.map((film) => (
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
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              }
            >
              <Meta
                title={
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {film.title}
                  </Title>
                }
                description={
                  <Paragraph ellipsis={{ rows: 3 }} style={{ marginTop: '10px' }}>
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
                  e.stopPropagation()
                  handleMovieClick(film.id)
                }}
              >
                Book Now
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Films
