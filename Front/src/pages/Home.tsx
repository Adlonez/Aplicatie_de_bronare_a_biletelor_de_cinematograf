import React, { useMemo } from "react";
import BannerCarousel from "../components/dataDisplay/BannerCarousel";
import CinemaCarousel from "../components/dataDisplay/MiniCarousel";
import filmsData from "../_mock/films.json";
import newsData from "../_mock/news.json";
import CinemaNews from "../components/dataDisplay/CinemaNews";
import type { Films } from "../types/ui";
import { Divider, Space } from "antd";

const Home: React.FC = () => {
  const films = filmsData as Films[];
  const news = newsData.slice(0,3) as any[]; 

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

  return (
    <div>
      <Space orientation="vertical" size="middle" style={{ display: 'flex' }}>
        <BannerCarousel slides={topTierItems} />
        <Divider/>
        <CinemaCarousel title="In progress" items={inProgressItems} />
        <CinemaCarousel title="Coming Soon" items={comingSoonItems} />
        <Divider/>
        <CinemaNews items={news} />
      </Space>
    </div>
  );
};

export default Home;
