import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button, Layout, Menu, Typography, Drawer } from 'antd'
import {
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  VideoCameraOutlined,
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

const MainLayout = (props: any) => {
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
              type="primary" onClick={() => setIsDark(!isDark)}
            />
            {isLoggedIn ? (
              <>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => navigate('/profile')}
                  className='ml-2'
                >
                  Profile
                </Button>

                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  className='ml-2'
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => navigate('/login')}
                className='ml-2'
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
          <div className='py-0 px-6 min-h-full'>
            <Outlet />
          </div>
        </Content>

        <Footer className="text-center">
          © 2026 All rights registered.
        </Footer>
      </Layout>
    </Layout>
  )
}

export default MainLayout
