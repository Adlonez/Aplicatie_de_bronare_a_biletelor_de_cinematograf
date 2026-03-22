import React, { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button, Layout, Menu, Typography, Drawer } from 'antd'
import {
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

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
interface IMainLayotProps{
  isDark:boolean;
  setIsDark:(value: boolean) => void;
}
const MainLayout = (props: IMainLayotProps) => {
  const { setIsDark, isDark } = props
  const [activeTab, setActiveTab] = useState<string>('home')
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
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

      <Layout style={{ minHeight: '100vh' }}>
        <Header className="h-16 flex justify-between items-center">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            style={{ fontSize: '18px' }}
          />
          <Title
            level={4}
            className="hidden lg:block m-0 absolute left-1/2 -translate-x-1/2"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            CinemaUTM
          </Title>
          <div>
            <Button 
              icon={isDark ? <SunOutlined /> : <MoonOutlined />} 
              type="primary" onClick={() => setIsDark(!isDark)}
            />
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/admin/dashboard')}
                    className='ml-2'
                  >
                    Admin Panel
                  </Button>
                )}
                <Button
                  icon={<UserOutlined />}
                  className='ml-2'
                  disabled
                >
                  {user?.name}
                </Button>
                <Button
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
                onClick={() => navigate('/auth/login')}
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
