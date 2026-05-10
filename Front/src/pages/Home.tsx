import React, { useEffect, useMemo, useState } from "react";
import BannerCarousel from "../components/dataDisplay/BannerCarousel";
import CinemaCarousel from "../components/dataDisplay/MiniCarousel";
import axiosInstance from '../api/axiosInstance'
import CinemaNews from "../components/dataDisplay/CinemaNews";
import type { Films, NewsItem } from "../types/ui";
import { Alert, Button, Spin } from "antd";
import { GiftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";



const Home: React.FC = () => {
  const navigate = useNavigate()
  const [films, setFilms] = useState<Films[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inProgressItems = useMemo(
    () => films.filter((film) => film.status === "progress"),
    [films]
  );

  const comingSoonItems = useMemo(
    () => films.filter((film) => film.status === "soon"),
   [films]
  );

  const topTierItems = useMemo(
    () => films.filter((film) => film.toptier),
    [films]
  );
   
  useEffect(() => {
    let isMounted = true

    Promise.all([
      axiosInstance.get('/api/news/list'),
      axiosInstance.get('/api/films/list'),
    ])
      .then(([newsResponse, filmsResponse]) => {
        if (!isMounted) return
        setNews((newsResponse.data.data ?? []).slice(0, 3))
        setFilms(filmsResponse.data.data ?? [])
      })
      .catch(() => {
        if (!isMounted) return
        setError('Failed to load cinema content. Please try again later.')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (error) return <Alert message={error} type="error" style={{ margin: 24 }} />
  
  return (
    <div className="home-page">
      <BannerCarousel slides={topTierItems} />

      <section className="cinema-section">
        <CinemaCarousel title="Now Showing" items={inProgressItems} />
      </section>

      <section className="cinema-section cinema-section-alt">
        <CinemaCarousel title="Coming Soon" items={comingSoonItems} />
      </section>

      <section className="cinema-section">
        <div className="cinema-section-inner">
          <div className="promo-card">
            <div className="promo-card-content">
              <div className="cinema-section-kicker">
                <GiftOutlined />
                Cinema offers
              </div>
              <h2 className="promo-card-title">
                Purple nights, <span>better seats</span>, bigger stories.
              </h2>
              <p className="promo-card-text">
                Pick a showtime, reserve your place, and keep an eye on our latest premieres and promotions.
              </p>
              <div className="hero-actions">
                <Button type="primary" size="large" onClick={() => navigate('/films')}>
                  Browse films
                </Button>
                <Button size="large" icon={<RightOutlined />} iconPosition="end" onClick={() => navigate('/news')}>
                  View updates
                </Button>
              </div>
            </div>
            <div className="promo-card-visual" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="cinema-section cinema-section-alt">
        <CinemaNews items={news} />
      </section>
    </div>
  )
}

export default Home
