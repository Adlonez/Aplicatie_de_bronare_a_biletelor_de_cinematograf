import { Layout, Menu, Typography } from 'antd';
import { HomeOutlined, LoginOutlined, VideoCameraOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';

const SideBar = () => {
    const{Sider}=Layout
    const [activeTab, setActiveTab] = useState<string>('home');
  const [collapsed, setCollapsed] = useState<boolean>(false);
    const { Title } = Typography;
  const menuItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined /> },
    { key: 'login', label: 'Log In', icon: <LoginOutlined /> },
    { key: 'filmlist', label: 'Film List', icon: <VideoCameraOutlined /> },
    { key: 'news', label: 'News', icon: <FileTextOutlined /> },
  ];

  return (
   <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
            background: 'rgba(107, 33, 168, 0.8)',
            backdropFilter: 'blur(10px)',
            overflow: 'auto',
          }}
        >
          <div style={{ 
            height: 64, 
            margin: 16, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(124, 58, 237, 0.5)'
          }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              <VideoCameraOutlined style={{ marginRight: 8 }} />
              CinemUTM
            </Title>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            items={menuItems}
            style={{ 
              background: 'transparent',
              borderRight: 'none'
            }}
          />
        </Sider>
  )
}

export default SideBar