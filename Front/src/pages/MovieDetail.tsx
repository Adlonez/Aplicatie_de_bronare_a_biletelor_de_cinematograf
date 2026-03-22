import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Row, Col, Space, Tag, Divider, Spin, Alert, message } from 'antd'
import { PlayCircleOutlined, ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { Films } from '../types/ui'
import axiosInstance from '../api/axiosInstance'

const { Title, Paragraph } = Typography

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Films | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(() => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
    return watchlist.includes(Number(id))
  })

  useEffect(() => {
    axiosInstance.get(`/api/films/${id}`)
      .then((res) => setMovie(res.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleBuyTickets = () => {
    if (!selectedTime) {
      message.warning('Please select a showtime first')
      return
    }
    navigate(`/films/${id}/book`, { state: { movie, time: selectedTime } })
  }

  const handleAddToWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
    if (!isInWatchlist) {
      message.success(`${movie?.title} added to your watchlist!`)
      watchlist.push(movie?.id)
    } else {
      message.info(`${movie?.title} removed from your watchlist`)
      const idx = watchlist.indexOf(movie?.id)
      if (idx > -1) watchlist.splice(idx, 1)
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
    setIsInWatchlist(!isInWatchlist)
  }

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (notFound) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Title level={2}>Movie not found</Title>
      <Button type="primary" onClick={() => navigate('/films')}>Back to Movies</Button>
    </div>
  )
  if (!movie) return <Alert message="Failed to load movie." type="error" style={{ margin: 24 }} />

  const showtimes = ['10:00 AM', '1:30 PM', '4:00 PM', '7:30 PM', '10:00 PM']

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
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            }
            style={{ border: 'none' }}
          />
        </Col>

        <Col xs={24} md={14}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={1} style={{ marginBottom: '8px' }}>{movie.title}</Title>
              {movie.genre && (
                <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {movie.genre}
                </Tag>
              )}
            </div>

            <Divider style={{ borderColor: '#434343' }} />

            <div>
              <Title level={4}>Description</Title>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {movie.description}
              </Paragraph>
            </div>

            <div>
              <Title level={4}>Showtimes</Title>
              <Space wrap>
                {showtimes.map((time) => (
                  <Button
                    key={time}
                    icon={<ClockCircleOutlined />}
                    type={selectedTime === time ? 'primary' : 'default'}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
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
  )
}

export default MovieDetail
