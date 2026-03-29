import React, { useEffect, useMemo, useState } from "react";
import BannerCarousel from "../components/dataDisplay/BannerCarousel";
import CinemaCarousel from "../components/dataDisplay/MiniCarousel";
import axiosInstance from '../api/axiosInstance'
import CinemaNews from "../components/dataDisplay/CinemaNews";
import type { Films, NewsItem } from "../types/ui";
import { Alert, Divider, Space, Spin } from "antd";



const Home: React.FC = () => {
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
     axiosInstance.get('/api/news/list')
      .then((res) => setNews(res.data.data.slice(0,3)))
      .catch(() => setError('Failed to load news. Please try again later.'))
      .finally(() => setLoading(false))
    axiosInstance.get('/api/films/list')
      .then((res) => setFilms(res.data.data))
      .catch(() => setError('Failed to load films. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  if (error) return <Alert message={error} type="error" style={{ margin: 24 }} />
  
  return (
    <div>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
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
