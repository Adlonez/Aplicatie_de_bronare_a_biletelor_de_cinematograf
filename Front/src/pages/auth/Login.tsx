import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Divider, theme, Alert, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { MailOutlined, LockOutlined, LoginOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import axiosInstance from '../../api/axiosInstance'
import { useAuth } from '../../contexts/AuthContext'
import { paths } from '../../routes/paths'
import type { AxiosError } from 'axios'

const { Title, Text } = Typography
const { useToken } = theme

interface LoginFormValues {
  email: string
  password: string
}

type AuthErrorResponse = {
  message?: string
}

const Login = () => {
  const { token } = useToken()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosInstance.post('/api/auth/login', values)
      login(data.data.token, {
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
      })
      navigate(paths.home)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<AuthErrorResponse>
      setError(axiosError.response?.data?.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillAndLogin = (email: string, pass: string) => {
    form.setFieldsValue({ email, password: pass })
    onFinish({ email, password: pass })
  }

  return (
    <div className="auth-page" style={{ flexDirection: 'column' }}>
      <Card
        className="auth-card"
        style={{
          boxShadow: `0 8px 32px ${token.colorPrimary}33`,
          border: `1px solid ${token.colorPrimary}4D`,
          marginBottom: 24
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

          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
          )}

          <Form
            form={form}
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
                loading={loading}
                style={{ fontWeight: 600 }}
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
              onClick={() => navigate(paths.auth.register)}
              style={{ padding: 0, fontWeight: 600 }}
            >
              Sign Up
            </Button>
          </div>
        </Space>
      </Card>

      <Card
        className="auth-card"
        title={<Text strong style={{ color: token.colorTextSecondary }}>Quick Access (Demo Accounts)</Text>}
        style={{
          boxShadow: `0 4px 16px ${token.colorTextQuaternary}1A`,
          border: `1px dashed ${token.colorBorder}`
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Button 
              block 
              icon={<UserOutlined />} 
              onClick={() => fillAndLogin('user_demo@demo.com', 'user_demo')}
              disabled={loading}
            >
              User Demo
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              block 
              icon={<SettingOutlined />} 
              onClick={() => fillAndLogin('admin_demo@demo.com', 'admin_demo')}
              disabled={loading}
            >
              Admin Demo
            </Button>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Click to fill and login instantly
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
