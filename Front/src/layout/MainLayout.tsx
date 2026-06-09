import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button, Layout, Menu, Typography, Drawer } from 'antd'
import {
  EnvironmentOutlined,
  FacebookOutlined,
  FileTextOutlined,
  HomeOutlined,
  InstagramOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MoonOutlined,
  PhoneOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
  VideoCameraOutlined,
  YoutubeOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { paths } from '../routes/paths'

const { Header, Footer, Content } = Layout
const { Text, Title } = Typography

const menuItems = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: <Link to="/">Home</Link>,
  },
  {
    key: 'filmlist',
    icon: <VideoCameraOutlined />,
    label: <Link to="/films">Film List</Link>,
  },
  {
    key: 'news',
    icon: <FileTextOutlined />,
    label: <Link to="/news">News</Link>,
  },
]

interface IMainLayoutProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const MainLayout = (props: IMainLayoutProps) => {
  const { setIsDark, isDark } = props
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const activeTab = location.pathname.startsWith('/films')
    ? 'filmlist'
    : location.pathname.startsWith('/news')
      ? 'news'
      : 'home'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Layout className="cinema-shell min-h-screen">
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span className="cinema-brand-mark">
              <VideoCameraOutlined />
            </span>
            <span>CinemaUTM</span>
          </div>
        }
        placement="left"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        size={250}
        styles={{
          body: { padding: 0, backdropFilter: 'blur(12px)' }
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={() => setOpen(false)}
          items={menuItems}
        />
      </Drawer>

      <Layout style={{ minHeight: '100vh' }}>
        <Header className="cinema-header">
          <div className="cinema-nav-frame">
            <button
              className="cinema-brand"
              type="button"
              onClick={() => navigate('/')}
              aria-label="Go to homepage"
            >
              <span className="cinema-brand-mark">
                <VideoCameraOutlined />
              </span>
              <span className="cinema-brand-title">CinemaUTM</span>
            </button>

            <Menu
              className="cinema-nav-menu"
              mode="horizontal"
              selectedKeys={[activeTab]}
              items={menuItems}
            />

            <div className="cinema-actions">
              <Button
                className="cinema-mobile-menu-button"
                icon={<MenuOutlined />}
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              />
            <Button
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              type="primary"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            />
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/admin/dashboard')}
                    className='ml-2'
                  >
                    <span className="desktop-action-label">Admin Panel</span>
                  </Button>
                )}
                <Button
                  icon={<UserOutlined />}
                  onClick={() => navigate('/' + paths.profile)}
                  className="ml-2"
                >
                  <span className="desktop-action-label">{user?.name}</span>
                </Button>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <span className="desktop-action-label">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate('/auth/login')}
                className="ml-2"
              >
                <span className="desktop-action-label">Sign in</span>
              </Button>
            )}
            </div>
          </div>
        </Header>

        <Content className="cinema-main">
          <div className="cinema-content">
            <Outlet />
          </div>
        </Content>
        <Footer className="cinema-footer">
          <div className="cinema-footer-inner">
            <div>
              <div className="cinema-brand" style={{ cursor: 'default', marginBottom: 18 }}>
                <span className="cinema-brand-mark">
                  <VideoCameraOutlined />
                </span>
                <span className="cinema-brand-title">CinemaUTM</span>
              </div>
              <p className="m-0 text-sm opacity-80">
                The best place to enjoy the latest movies, premieres, and unforgettable cinema nights.
              </p>
            </div>

            <div>
              <Title level={5} className="mb-3!">
                Visit
              </Title>
              <p className="mb-2 flex items-center gap-2">
                <PhoneOutlined />
                <a href="tel:+37322123456">+373 22 123 456</a>
              </p>
              <p className="mb-2 flex items-center gap-2">
                <MailOutlined />
                <a href="mailto:contact@cinemautm.md">contact@cinemautm.md</a>
              </p>
              <p className="m-0 flex items-center gap-2">
                <EnvironmentOutlined />
                168 Stefan cel Mare Blvd, Chisinau, Moldova
              </p>
            </div>

            <div>
              <Title level={5} className="mb-3!">
                Pages
              </Title>
              <div className="flex flex-col gap-2 text-sm opacity-90">
                <Link to="/">Home</Link>
                <Link to="/films">Film List</Link>
                <Link to="/news">News</Link>
              </div>
            </div>

            <div className="cinema-footer-callout">
              <Title level={5} className="mb-3!">
                Stay connected
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.78)', display: 'block', marginBottom: 16 }}>
                Follow premieres, schedule updates, and offers from our cinema.
              </Text>
              <div className="flex flex-wrap items-center gap-3 text-base">
                <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer">
                  <FacebookOutlined />
                </a>
                <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer">
                  <InstagramOutlined />
                </a>
                <a aria-label="YouTube" href="https://youtube.com" target="_blank" rel="noreferrer">
                  <YoutubeOutlined />
                </a>
              </div>
            </div>
          </div>

          <div className="cinema-footer-bottom">
            2026 CinemaUTM. All rights reserved.
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default MainLayout
