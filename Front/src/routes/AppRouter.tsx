import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from '../layout/main/MainLayout'
import AdminLayout from '../layout/admin/AdminLayout'

import Home from '../components/pages/Home'
import News from '../components/pages/News'
import Films from '../components/pages/Films'

import Login from '../components/pages/auth/Login'
import Register from '../components/pages/auth/Register'
import Dashboard from '../components/admin/Dashboard'
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public layout routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="films" element={<Films />} />
        </Route>

        {/* Auth routes (NO layout) */}
         <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} /> 

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} /> 
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter