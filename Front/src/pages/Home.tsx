import React, { useEffect, useState, useMemo } from 'react'
import { Divider, Space, Spin, Alert } from 'antd'
import BannerCarousel from '../components/dataDisplay/BannerCarousel'
import CinemaCarousel from '../components/dataDisplay/MiniCarousel'
import CinemaNews from '../components/dataDisplay/CinemaNews'
import type { Films, NewsItem } from '../types/ui'
import axiosInstance from '../api/axiosInstance'

const Home: React.FC = () => {
  const [films, setFilms] = useState<Films[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filmsRes, newsRes] = await Promise.all([
          axiosInstance.get('/api/films/list'),
          axiosInstance.get('/api/news/list'),
        ])
        setFilms(filmsRes.data.data)
        setNews(newsRes.data.data.slice(0, 3))
      } catch {
        setError('Failed to load content. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const inProgressItems = useMemo(() => films.filter((f) => f.status === 'progress'), [films])
  const comingSoonItems = useMemo(() => films.filter((f) => f.status === 'soon'), [films])
  const topTierItems = useMemo(() => films.filter((f) => f.toptier), [films])

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
