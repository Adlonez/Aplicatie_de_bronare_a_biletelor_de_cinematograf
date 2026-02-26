import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import MainLayout from '../layout/MainLayout'
import AdminLayout from '../layout/admin/AdminLayout'

import Home from '../pages/Home'
import News from '../pages/News'
import Films from '../pages/Films'
import MovieDetail from '../pages/MovieDetail'
import BookTicket from '../pages/BookTicket'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/admin/Dashboard'
import Movies from '../pages/admin/Movies'
import Users from '../pages/admin/Users'
import Bookings from '../pages/admin/Bookings'
import Screenings from '../pages/admin/Screenings'
import NotFound from '../pages/NotFound'
const AppRouter = (props:any) => {
  const {setIsDark, isDark} = props;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout setIsDark={setIsDark} isDark={isDark}/>}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="films" element={<Films />} />
          <Route path="films/:id" element={<MovieDetail />} />
          <Route path="films/:id/book" element={<BookTicket />} />
        </Route>

         <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} /> 
       
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} /> 
          <Route path="movies" element={<Movies />} />
          <Route path="screenings" element={<Screenings />} />
          <Route path="users" element={<Users />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>

          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter