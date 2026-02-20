import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const {
    token: { colorBgContainer, colorText, colorBgLayout, colorBorderSecondary },
  } = theme.useToken()

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/movies',
      icon: <VideoCameraOutlined />,
      label: 'Movies',
    },
    {
      key: '/admin/screenings',
      icon: <CalendarOutlined />,
      label: 'Screenings',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/admin/bookings',
      icon: <BookOutlined />,
      label: 'Bookings',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // Handle default selection when navigating to /admin or /admin/
  const selectedKey = location.pathname === '/admin' || location.pathname === '/admin/' ? '/admin/dashboard' : location.pathname

  return (
    <Layout style={{ minHeight: '100vh', background: colorBgLayout }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        style={{ 
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: colorBgContainer, 
          borderRight: `1px solid ${colorBorderSecondary}`,
          zIndex: 100
        }}
      >

        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colorText,
            fontSize: collapsed ? '14px' : '20px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          {collapsed ? 'AP' : 'Admin Panel'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: colorBgContainer, borderRight: 0 }}
        />

      </Sider>
      <Layout style={{ background: colorBgLayout, marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer, 
          display: 'flex', 
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 99,
          width: `calc(100% - ${collapsed ? 80 : 200}px)`,
          transition: 'width 0.2s'
        }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '18px', padding: '0 24px', cursor: 'pointer', color: colorText },
          })}
        </Header>
        <Content
          style={{
            margin: '88px 16px 24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            color: colorText,
            borderRadius: 8, 
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
