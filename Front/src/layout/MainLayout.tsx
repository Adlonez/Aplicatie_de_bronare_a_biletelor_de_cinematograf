import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
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
  SunOutlined,
  UserOutlined,
  VideoCameraOutlined,
  YoutubeOutlined,
} from '@ant-design/icons'

const { Header, Footer, Content } = Layout
const { Title } = Typography

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

interface IMainLayotProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const MainLayout = (props: IMainLayotProps) => {
  const { setIsDark, isDark } = props
  const [activeTab, setActiveTab] = useState<string>('home')
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <Layout className="min-h-screen">
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <VideoCameraOutlined />
            CinemaUTM
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
          onClick={({ key }) => {
            setActiveTab(key)
            setOpen(false)
          }}
          items={menuItems}
        />
      </Drawer>

      <Layout>
        <Header className="h-16 flex justify-between items-center">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            style={{ fontSize: '18px' }}
          />
          <Title level={4} className="hidden lg:block m-0 absolute left-1/2 -translate-x-1/2">
            CinemaUTM
          </Title>
          <div>
            <Button
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              type="primary"
              onClick={() => setIsDark(!isDark)}
            />
            {isLoggedIn ? (
              <>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => navigate('/profile')}
                  className="ml-2"
                >
                  Profile
                </Button>

                <Button
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className="ml-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate('/auth/login')}
                className="ml-2"
              >
                Login
              </Button>
            )}
          </div>
        </Header>

        <Content
          className="my-4 overflow-auto"
          style={{ margin: '24px 16px 0' }}
        >
          <div className="py-0 px-6 min-h-full">
            <Outlet />
          </div>
        </Content>
        <Footer className="mt-8 px-6 py-8" >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Title level={5} className="!mb-3">
                CinemaUTM
              </Title>
              <p className="m-0 text-sm opacity-80">
                The best place to enjoy the latest movies, premieres, and unforgettable cinema nights.
              </p>
            </div>

            <div>
              <Title level={5} className="!mb-3">
                Contact
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
              <Title level={5} className="!mb-3">
                Follow us
              </Title>
              <div className="flex flex-wrap items-center gap-4 text-base">
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <FacebookOutlined /> Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  <InstagramOutlined /> Instagram
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  <YoutubeOutlined /> YouTube
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-solid border-gray-300 pt-4 text-center text-sm opacity-70">
             2026 CinemaUTM. All rights reserved.
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default MainLayout
