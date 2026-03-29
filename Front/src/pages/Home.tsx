import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BannerCarousel from "../components/dataDisplay/BannerCarousel";
import CinemaCarousel from "../components/dataDisplay/MiniCarousel";
import filmsData from "../_mock/films.json";
import screeningsData from "../_mock/screenings.json";
import newsData from "../_mock/news.json";
import CinemaNews from "../components/dataDisplay/CinemaNews";
import type { Films, NewsItem, Screening } from "../types/ui";
import { Button, Card, Col, Divider, Form, Row, Select, Space, Typography, message } from "antd";

const { Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const films = filmsData as Films[];
  const screenings = screeningsData as Screening[];
  const news = newsData.slice(0,3) as NewsItem[]; 
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedFilm, setSelectedFilm] = useState<string | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined);

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
      message.warning("Please select date, film and hour first.");
      return;
    }

    const screening = screenings.find(
      (item) =>
        item.date === selectedDate &&
        item.movieTitle === selectedFilm &&
        item.time === selectedHour
    );

    if (!screening) {
      message.error("No screening found for the selected options.");
      return;
    }

    navigate(`/films/${screening.movieId}/book`, {
      state: {
        time: `${selectedDate} ${selectedHour}`,
        date: selectedDate,
        hour: selectedHour,
      },
    });
  };

  const inProgressItems = useMemo(
    () => filteredFilms.filter((film) => film.status === "progress"),
    [filteredFilms]
  );

  const comingSoonItems = useMemo(
    () => filteredFilms.filter((film) => film.status === "soon"),
    [filteredFilms]
  );

  const topTierItems = useMemo(
    () => filteredFilms.filter((film) => film.toptier),
    [filteredFilms]
  );

  return (
    <div>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="Find Your Screening">
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

        <BannerCarousel slides={topTierItems} />
        <Divider />
        <CinemaCarousel title="In progress" items={inProgressItems} />
        <CinemaCarousel title="Coming Soon" items={comingSoonItems} />
        <Divider />
        <CinemaNews items={news} />
      </Space>
    </div>
  )
}

export default Home
