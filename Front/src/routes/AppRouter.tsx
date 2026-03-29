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

import NotFound from '../pages/errors/NotFound'
import Unauthorized from '../pages/errors/Unauthorized'
import ForbiddenUser from '../pages/errors/ForbiddenUser'
import ServerError from '../pages/errors/ServerError'

import { useAuth } from '../contexts/AuthContext'
import { paths } from './paths'

type AppRouterProps = {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to={paths.auth.login} replace />
  if (!isAdmin) return <Navigate to={paths.errors.unauthorized} replace />
  return <>{children}</>
}

const AppRouter = ({ isDark, setIsDark }: AppRouterProps) => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path={paths.home} element={<MainLayout setIsDark={setIsDark} isDark={isDark} />}>
          <Route index element={<Home />} />
          <Route path={paths.news} element={<News />} />
          <Route path={paths.films} element={<Films />} />
          <Route path={paths.filmDetail} element={<MovieDetail />} />
          <Route path={paths.bookTicket} element={<BookTicket />} />
        </Route>

        <Route path={paths.auth.login} element={<Login />} />
        <Route path={paths.auth.register} element={<Register />} />

        <Route
          path={paths.admin.root}
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to={paths.admin.dashboard} replace />} />
          <Route path={paths.admin.dashboard} element={<Dashboard />} />
          <Route path={paths.admin.movies} element={<Movies />} />
          <Route path={paths.admin.screenings} element={<Screenings />} />
          <Route path={paths.admin.users} element={<Users />} />
          <Route path={paths.admin.bookings} element={<Bookings />} />
        </Route>

        <Route path={paths.errors.unauthorized} element={<Unauthorized />} />
        <Route path={paths.errors.forbidden} element={<ForbiddenUser />} />
        <Route path={paths.errors.serverError} element={<ServerError />} />
        <Route path={paths.errors.notFound} element={<NotFound />} />
        <Route path={paths.notFound} element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
