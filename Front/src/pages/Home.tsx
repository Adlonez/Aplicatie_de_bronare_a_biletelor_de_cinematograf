import React from 'react'
import ClickableCarousel from '../components/dataDisplay/Carousel'
import CinemaCarousel from '../components/MiniCarousel'
import films from "../_mock/films.json"

const Home = () => {
  const InProgressitems:any=films
  const ComingSoonitems:any=films
  return (
   
    <div>
      <ClickableCarousel/>
      <CinemaCarousel title="In progress" items={ InProgressitems }/>
      <CinemaCarousel title="Coming Soon" items={ ComingSoonitems }/>
    </div>
    

  )
}

export default Home