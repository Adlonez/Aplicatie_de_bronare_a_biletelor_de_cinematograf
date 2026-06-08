import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  QRCode,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axiosInstance'
import type { BookingInfo, Hall, UserProfile } from '../types/ui'
import { paths } from '../routes/paths'
import SeatMap from '../components/admin/SeatMap'

const { Title, Text } = Typography

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'red'
    case 'bought':
      return 'blue'
    case 'booked':
      return 'orange'
    default:
      return 'default'
  }
}

const roleColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'purple'
    case 'user':
      return 'cyan'
    default:
      return 'default'
  }
}

const Profile = () => {
  const { isAuthenticated, updateUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [halls, setHalls] = useState<Hall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [detailsBooking, setDetailsBooking] = useState<BookingInfo | null>(null)
  const [seatmapBooking, setSeatmapBooking] = useState<BookingInfo | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const [form] = Form.useForm<{ name: string; phone: string }>()

  useEffect(() => {
    let isMounted = true

    Promise.all([
      axiosInstance.get('/api/profile/me'),
      axiosInstance.get('/api/halls/list').catch(() => ({ data: [] })),
    ]).then(([profileRes, hallsRes]) => {
      if (!isMounted) return
      const data: UserProfile = profileRes.data?.data ?? profileRes.data
      setProfile(data)
      const hallData: Hall[] = hallsRes.data?.data ?? hallsRes.data ?? []
      setHalls(Array.isArray(hallData) ? hallData : [])
    }).catch(() => {
      if (!isMounted) return
      setError('Failed to load profile. Please try again later.')
    }).finally(() => {
      if (!isMounted) return
      setLoading(false)
    })

    return () => { isMounted = false }
  }, [])

  const openEditModal = () => {
    if (!profile) return
    form.setFieldsValue({ name: profile.name, phone: profile.phone })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const res = await axiosInstance.put('/api/profile/me', {
        name: values.name,
        phone: values.phone,
      })
      const updated: UserProfile = res.data?.data ?? res.data
      setProfile(updated)
      updateUser({ name: updated.name })
      message.success('Profile updated successfully.')
      setEditModalOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'isAxiosError' in err) {
        message.error('Failed to update profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id: number) => {
    setCancellingId(id)
    try {
      await axiosInstance.post(`/api/bookings/${id}/cancel`)
      message.success('Booking cancelled.')
      setProfile(p => p ? { ...p, bookings: p.bookings.filter(b => b.id !== id) } : p)
    } catch {
      message.error('Failed to cancel booking. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const bookingColumns = useMemo((): ColumnsType<BookingInfo> => [
    {
      title: 'Movie',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      ellipsis: true,
    },
    {
      title: 'Showtime',
      dataIndex: 'showtime',
      key: 'showtime',
      render: (val: string) => val ?? '—',
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      key: 'hall',
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      key: 'seats',
      render: (seats: string[]) => seats?.length ? seats.join(', ') : '—',
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `$${price?.toFixed(2) ?? '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColor(status)}>{status?.toUpperCase() ?? '—'}</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => setDetailsBooking(record)}>
            Details
          </Button>
          <Button size="small" onClick={() => setSeatmapBooking(record)}>
            Seatmap
          </Button>
          {record.status === 'booked' && (
            <Popconfirm
              title="Cancel this booking?"
              description="This cannot be undone."
              onConfirm={() => handleCancel(record.id)}
              okText="Yes, cancel"
              cancelText="No"
            >
              <Button
                size="small"
                danger
                loading={cancellingId === record.id}
              >
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [cancellingId])

  if (!isAuthenticated) {
    return <Navigate to={paths.auth.login} replace />
  }

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}
      />
    )
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: 24 }} />
  }

  const seatmapHall = seatmapBooking
    ? halls.find(h => h.name === seatmapBooking.hall) ?? null
    : null

  return (
    <div className="cinema-page-shell">
      <div className="cinema-page-title">
        <div className="cinema-section-kicker">
          <UserOutlined />
          Account
        </div>
        <Title level={1} style={{ margin: 0 }}>
          My Profile
        </Title>
      </div>

      {/* Profile card */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={14}>
          <Card
            title="Profile Information"
            extra={
              <Button type="primary" onClick={openEditModal}>
                Edit Profile
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Name</Text>
                <div><Text strong>{profile?.name ?? '—'}</Text></div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Email</Text>
                <div><Text strong>{profile?.email ?? '—'}</Text></div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Phone</Text>
                <div><Text strong>{profile?.phone || '—'}</Text></div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Role</Text>
                <div>
                  <Tag color={roleColor(profile?.role ?? '')}>
                    {profile?.role?.toUpperCase() ?? '—'}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Registration Date</Text>
                <div>
                  <Text strong>
                    {profile?.registrationDate
                      ? new Date(profile.registrationDate).toLocaleDateString()
                      : '—'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Status</Text>
                <div>
                  <Tag color={statusColor(profile?.status ?? '')}>
                    {profile?.status?.toUpperCase() ?? '—'}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Bookings table */}
      <Card title="My Bookings">
        <Table<BookingInfo>
          columns={bookingColumns}
          dataSource={profile?.bookings ?? []}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No bookings yet.' }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Edit modal */}
      <Modal
        title="Edit Profile"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        okText="Save"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name.' }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: false }]}>
            <Input placeholder="+1 (555) 000-0000" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Booking details modal (fullscreen) */}
      <Modal
        title={detailsBooking ? `Booking #${detailsBooking.id} — ${detailsBooking.movieTitle}` : ''}
        open={!!detailsBooking}
        onCancel={() => setDetailsBooking(null)}
        footer={null}
        width="100%"
        style={{ top: 0, paddingBottom: 0 }}
        styles={{ body: { height: 'calc(100vh - 110px)', overflowY: 'auto' } }}
        destroyOnClose
      >
        {detailsBooking && (
          <div style={{ padding: '8px 0' }}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 32 }}>
              <Descriptions.Item label="Booking ID">{detailsBooking.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColor(detailsBooking.status)}>
                  {detailsBooking.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Movie">{detailsBooking.movieTitle}</Descriptions.Item>
              <Descriptions.Item label="Hall">{detailsBooking.hall}</Descriptions.Item>
              <Descriptions.Item label="Showtime">{detailsBooking.showtime ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Booking Date">
                {detailsBooking.bookingDate
                  ? new Date(detailsBooking.bookingDate).toLocaleDateString()
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Seats">
                {detailsBooking.seats?.join(', ') ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Total Price">
                ${detailsBooking.totalPrice?.toFixed(2) ?? '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="Name">{detailsBooking.customerName}</Descriptions.Item>
              <Descriptions.Item label="Email">{detailsBooking.customerEmail}</Descriptions.Item>
              <Descriptions.Item label="Phone">{detailsBooking.customerPhone || '—'}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginBottom: 16 }}>Ticket QR Codes</Title>
            <Space wrap size="large">
              {detailsBooking.seats?.map(seat => (
                <div key={seat} style={{ textAlign: 'center' }}>
                  <QRCode
                    value={`${detailsBooking.movieId}_${seat}_${detailsBooking.id}`}
                    size={140}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{seat}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </div>
        )}
      </Modal>

      {/* Seatmap modal */}
      <Modal
        title={seatmapBooking ? `Seatmap — ${seatmapBooking.hall}` : ''}
        open={!!seatmapBooking}
        onCancel={() => setSeatmapBooking(null)}
        footer={null}
        width={960}
        destroyOnClose
      >
        {seatmapBooking && (
          seatmapHall ? (
            <SeatMap
              hall={seatmapHall}
              bookedSeats={seatmapBooking.status === 'booked' ? seatmapBooking.seats : []}
              boughtSeats={seatmapBooking.status === 'bought' ? seatmapBooking.seats : []}
            />
          ) : (
            <Empty description="Seat layout unavailable for this hall." />
          )
        )}
      </Modal>
    </div>
  )
}

export default Profile
