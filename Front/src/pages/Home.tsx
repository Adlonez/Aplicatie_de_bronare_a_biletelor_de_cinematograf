import React, { useMemo } from "react";
import ClickableCarousel from "../components/dataDisplay/Carousel";
import CinemaCarousel from "../components/MiniCarousel";
import filmsData from "../_mock/films.json";
import newsData from "../_mock/news.json";
import CinemaNews from "../components/dataDisplay/CinemaNews";
import type { Films } from "../types/ui";

const Home: React.FC = () => {
  const films = filmsData as Films[];
  const news = newsData as any[]; // ideally type this too later

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
      <ClickableCarousel />
      <CinemaCarousel title="In progress" items={inProgressItems} />
      <CinemaCarousel title="Coming Soon" items={comingSoonItems} />
      <CinemaNews title="News" items={news} />
    </div>
  );
};

export default Home;
