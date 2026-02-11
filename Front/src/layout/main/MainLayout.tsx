import React from 'react'
import { Outlet } from 'react-router-dom'
import { ConfigProvider, Layout, theme } from 'antd'
import SideBar from './SideBar'
import Header from './Header'
import Footer from './Footer'

const{Content}=Layout

const MainLayout = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#7c3aed',
          colorBgContainer: 'rgba(146, 51, 234, 0.66)',
          colorBgElevated: 'rgba(107, 33, 168, 0.86)',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', backgroundColor: 'rgba(160, 67, 237, 0.8)' }}>
        <SideBar/>
        <Layout style={{backgroundColor: 'rgba(0,0,0,0)'}}>
          <Header />
          <Content style={{ margin: '24px 16px 0', overflow: 'auto' }}>
            <div style={{ padding: 24, minHeight: 360 }}>
              <Outlet /> 
            </div>
          </Content>
          <Footer/>
        </Layout>
      </Layout>
    </ConfigProvider>

  )
}

export default MainLayout