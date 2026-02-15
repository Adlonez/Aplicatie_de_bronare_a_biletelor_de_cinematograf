import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from '../layout/main/MainLayout'
import AdminLayout from '../layout/admin/AdminLayout'

import Home from '../pages/Home'
import News from '../pages/News'
import Films from '../pages/Films'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/admin/Dashboard'
import Movies from '../pages/admin/Movies'
import Users from '../pages/admin/Users'
import Bookings from '../pages/admin/Bookings'
import Screenings from '../pages/admin/Screenings'
import NotFound from '../pages/NotFound'
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="films" element={<Films />} />
        </Route>

         <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} /> 
       
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Dashboard />} />
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