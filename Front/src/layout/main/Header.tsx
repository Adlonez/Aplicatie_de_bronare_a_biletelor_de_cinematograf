import { Layout, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const Header = () => {
    const {Header} = Layout;
    const { Title } = Typography;
    return (
        <Header 
            style={{ 
              padding: '0 24px', 
              background: 'rgba(107, 33, 168, 0.8)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(124, 58, 237, 0.5)'
            }}
          >
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              <MenuOutlined style={{ marginRight: 12 }} />
             CinemUTM
            </Title>
          </Header>
    )
}

export default Header