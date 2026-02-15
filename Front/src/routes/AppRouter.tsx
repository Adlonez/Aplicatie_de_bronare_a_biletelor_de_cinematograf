import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from '../layout/main/MainLayout'
import AdminLayout from '../layout/admin/AdminLayout'

import Home from '../pages/Home'
import News from '../pages/News'
import Films from '../pages/Films'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../components/admin/Dashboard'
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
        </Route>

          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter