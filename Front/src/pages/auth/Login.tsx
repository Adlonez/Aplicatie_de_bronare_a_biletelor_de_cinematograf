import { Form, Input, Button, Card, Typography, Space, Divider, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

const Login = () => {
  const { token } = useToken();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Login:', values);
    // Add login logic here
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '40px 20px',
      background: token.colorBgLayout
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: `0 8px 32px ${token.colorPrimary}33`,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorPrimary}4D`
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: token.colorText, marginBottom: 8 }}>
              Welcome Back
            </Title>
            <Text style={{ color: token.colorTextSecondary, fontSize: '16px' }}>
              Login to access your cinema account
            </Text>
          </div>

          <Divider style={{ borderColor: token.colorBorder, margin: '8px 0' }} />
          
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Email address" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Password" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                icon={<LoginOutlined />}
                size="large"
                style={{
                  fontWeight: 600
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: token.colorBorder, margin: '8px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: token.colorTextSecondary }}>Don't have an account? </Text>
            <Button 
              type="link" 
              onClick={() => navigate('/auth/register')} 
              style={{ 
                padding: 0,
                fontWeight: 600
              }}
            >
              Sign Up
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;