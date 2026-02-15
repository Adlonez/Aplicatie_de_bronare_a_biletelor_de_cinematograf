import { Form, Input, Button, Card, Typography, Space, Divider, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

const Register = () => {
  const { token } = useToken();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Register:', values);
    // Add registration logic here
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
              Create Account
            </Title>
            <Text style={{ color: token.colorTextSecondary, fontSize: '16px' }}>
              Join our cinema community today
            </Text>
          </div>

          <Divider style={{ borderColor: token.colorBorder, margin: '8px 0' }} />
          
          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Full name" 
              />
            </Form.Item>

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
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Password (min 6 characters)" 
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Confirm password" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                icon={<UserAddOutlined />}
                size="large"
                style={{
                  fontWeight: 600
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: token.colorBorder, margin: '8px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: token.colorTextSecondary }}>Already have an account? </Text>
            <Button 
              type="link" 
              onClick={() => navigate('/auth/login')} 
              style={{ 
                padding: 0,
                fontWeight: 600
              }}
            >
              Login
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Register;