import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Space, Divider, theme, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, PhoneOutlined } from '@ant-design/icons'
import axiosInstance from '../../api/axiosInstance'
import { useAuth } from '../../contexts/AuthContext'
import { paths } from '../../routes/paths'
import type { AxiosError } from 'axios'

const { Title, Text } = Typography
const { useToken } = theme

interface RegisterFormValues {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

type AuthErrorResponse = {
  message?: string
}

const Register = () => {
  const { token } = useToken()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axiosInstance.post('/api/auth/register', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })
      login(data.data.token, {
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
      })
      navigate(paths.home)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<AuthErrorResponse>
      setError(axiosError.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Card
        className="auth-card"
        style={{
          boxShadow: `0 8px 32px ${token.colorPrimary}33`,
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

          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
          )}

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
              name="phone"
              rules={[{ required: true, message: 'Please input your phone number!' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: token.colorPrimary }} />}
                placeholder="Phone number"
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
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match!'))
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
                loading={loading}
                style={{ fontWeight: 600 }}
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
              onClick={() => navigate(paths.auth.login)}
              style={{ padding: 0, fontWeight: 600 }}
            >
              Login
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default Register
