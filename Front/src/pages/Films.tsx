import { useEffect, useMemo, useState } from 'react'
import { Card, Row, Col, Typography, Button, Spin, Alert, Form, Select, Space } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Films as FilmType, Screening } from '../types/ui'
import axiosInstance from '../api/axiosInstance'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card

const Films = () => {

  const navigate = useNavigate()
  const [films, setFilms] = useState<FilmType[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedFilm, setSelectedFilm] = useState<string | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    axiosInstance.get('/api/screenings/list')
      .then((res) => setScreenings(res.data.data))
      .catch(() => setError('Failed to load screenings. Please try again later.'))
      .finally(() => setLoading(false))
    axiosInstance.get('/api/films/list')
      .then((res) => setFilms(res.data.data))
      .catch(() => setError('Failed to load films. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])


  const handleMovieClick = (filmId: number) => {
    navigate(`/films/${filmId}`)
  }  
  
    const filteredFilms = useMemo(
      () =>
        films.filter((film) =>
          screenings.some(
            (screening) =>
              screening.movieId === film.id &&
              (!selectedDate || screening.date === selectedDate) &&
              (!selectedFilm || screening.movieTitle === selectedFilm) &&
              (!selectedHour || screening.time === selectedHour)
          )
        ),
      [films, screenings, selectedDate, selectedFilm, selectedHour]
    );


  const dateOptions = useMemo(
    () =>
      Array.from(new Set(screenings.map((screening) => screening.date)))
        .sort()
        .map((date) => ({ value: date, label: date })),
    [screenings]
  );

  const hourOptions = useMemo(
    () =>
      Array.from(
        new Set(
          screenings
            .filter(
              (screening) =>
                (!selectedDate || screening.date === selectedDate) &&
                (!selectedFilm || screening.movieTitle === selectedFilm)
            )
            .map((screening) => screening.time)
        )
      )
        .sort((a, b) => a.localeCompare(b))
        .map((time) => ({ value: time, label: time })),
    [screenings, selectedDate, selectedFilm]
  );

  const filmOptions = useMemo(
    () =>
      Array.from(
        new Set(
          screenings
            .filter(
              (screening) =>
                (!selectedDate || screening.date === selectedDate) &&
                (!selectedHour || screening.time === selectedHour)
            )
            .map((screening) => screening.movieTitle)
        )
      )
        .sort((a, b) => a.localeCompare(b))
        .map((title) => ({ value: title, label: title })),
    [screenings, selectedDate, selectedHour]
  );

  const canBuyTicket = useMemo(
    () => Boolean(selectedDate && selectedFilm && selectedHour),
    [selectedDate, selectedFilm, selectedHour]
  );

  const handleBuyTicket = () => {
    if (!selectedDate || !selectedFilm || !selectedHour) {
      setError("Please select date, film and hour first.");
      return;
    }

    const screening = screenings.find(
      (item) =>
        item.date === selectedDate &&
        item.movieTitle === selectedFilm &&
        item.time === selectedHour
    );

    if (!screening) {
      setError("No screening found for the selected options.");
      return;
    }

    const movie = films.find((film) => film.id === screening.movieId);
    if (!movie) {
      setError("Movie details were not found for the selected screening.");
      return;
    }

    navigate(`/films/${screening.movieId}/book`, {
      state: {
        movie,
        time: `${selectedDate} ${selectedHour}`,
        date: selectedDate,
        hour: selectedHour,
      },
    });
  };

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (error) return <Alert message={error} type="error" style={{ margin: 24 }} />

  return (
    <div className="cinema-page-shell">
      <Space orientation="vertical" size={28} style={{ display: 'flex' }}>
      <div className="cinema-page-title">
        <div className="cinema-section-kicker">Show times</div>
        <Title level={1} style={{ margin: 0 }}>
          Available Movies
        </Title>
      </div>

      <Card className="cinema-filter-card" title="Find Your Screening">
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Select date</Text>} style={{ marginBottom: 0 }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Select date"
                  options={dateOptions}
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Select film</Text>} style={{ marginBottom: 0 }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Select film"
                  options={filmOptions}
                  value={selectedFilm}
                  onChange={(value) => setSelectedFilm(value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label={<Text strong>Select hour</Text>} style={{ marginBottom: 0 }}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Select hour"
                  options={hourOptions}
                  value={selectedHour}
                  onChange={(value) => setSelectedHour(value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" style={{ marginTop: 16 }} gutter={[8, 8]}>
            <Col>
              <Button
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedFilm(undefined);
                  setSelectedHour(undefined);
                }}
              >
                Reset
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={handleBuyTicket} disabled={!canBuyTicket}>
                Buy Ticket
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Row gutter={[24, 24]}>
        {filteredFilms.map((film) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={film.id}>
            <Card
              className="film-grid-card"
              hoverable
              onClick={() => handleMovieClick(film.id)}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              styles={{
                body: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
                }
              }}
              cover={
                <img
                  alt={film.title}
                  src={film.image}
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
    </Space>
    </div>
  )
}

export default Films
