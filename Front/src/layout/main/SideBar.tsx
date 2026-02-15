import { Layout, Menu, Typography } from 'antd';
import { HomeOutlined, LoginOutlined, VideoCameraOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const SideBar = () => {
    const{Sider}=Layout
    const navigate = useNavigate();
    const location = useLocation();
    const { Title } = Typography;
  
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/auth/login')) return 'login';
    if (path.startsWith('/films')) return 'filmlist';
    if (path.startsWith('/news')) return 'news';
    return 'home';
  };

  const menuItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined /> },
    { key: 'login', label: 'Log In', icon: <LoginOutlined /> },
    { key: 'filmlist', label: 'Film List', icon: <VideoCameraOutlined /> },
    { key: 'news', label: 'News', icon: <FileTextOutlined /> },
  ];

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'login':
        navigate('/auth/login');
        break;
      case 'filmlist':
        navigate('/films');
        break;
      case 'news':
        navigate('/news');
        break;
    }
  };

  return (
   <Sider
          breakpoint="lg"
          collapsedWidth="0"
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
            selectedKeys={[getActiveKey()]}
            onClick={({ key }) => handleMenuClick(key)}
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