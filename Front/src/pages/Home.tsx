import React from 'react'
import ClickableCarousel from '../components/dataDisplay/Carousel'
import CinemaCarousel from '../components/MiniCarousel'
import films from "../_mock/films.json"
import news from "../_mock/news.json"
import CinemaNews from '../components/dataDisplay/CinemaNews'

const Home = () => {
  const InProgressitems:any=films
  const ComingSoonitems:any=films
  const News:any=news
  return (
   
    <div>
      <ClickableCarousel/>
      <CinemaCarousel title="In progress" items={ InProgressitems }/>
      <CinemaCarousel title="Coming Soon" items={ ComingSoonitems }/>
      <CinemaNews title="News" items={News} ></CinemaNews>
    </div>
    

  )
}

export default Home