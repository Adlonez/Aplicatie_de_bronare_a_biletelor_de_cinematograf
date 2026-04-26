import { useEffect, useState, type FC, type ReactNode, type CSSProperties } from 'react';
import { Alert, Card, Row, Col, Statistic, Table, theme, Typography } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, UnorderedListOutlined, TrophyOutlined, DashboardOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosInstance';

const { Title } = Typography;

const movieColumns = [
  { title: 'Movie Title', dataIndex: 'title' },
  { title: 'Bookings', dataIndex: 'bookingCount' },
  { title: 'Revenue', dataIndex: 'revenue', render: (val: number) => `$${val.toFixed(2)}` },
];

const StatCard = ({ title, value, icon, precision, valueStyle, suffix, loading }: { title: string; value: number | string; icon?: ReactNode; precision?: number; valueStyle?: CSSProperties; suffix?: string; loading?: boolean }) => (
  <Card bordered={false} style={{ height: '100%' }}>
    <Statistic title={title} value={value} prefix={icon} precision={precision} valueStyle={valueStyle} suffix={suffix} loading={loading} />
  </Card>
);

interface UserApi {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

interface BookingApi {
  totalBookings: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  bookedBookings: number;
  boughtBookings: number;
  totalSeatsBooked: number;
}

interface RevenueApi {
  totalRevenue: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageBookingValue: number;
}

interface TopMovieApi {
  movieId: number;
  title: string;
  bookingCount: number;
  seatsBooked: number;
  revenue: number;
}

const emptyUserStats: UserApi = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  adminUsers: 0,
  newUsersThisWeek: 0,
  newUsersThisMonth: 0,
};

const emptyBookingStats: BookingApi = {
  totalBookings: 0,
  bookingsThisWeek: 0,
  bookingsThisMonth: 0,
  bookedBookings: 0,
  boughtBookings: 0,
  totalSeatsBooked: 0,
};

const emptyRevenueStats: RevenueApi = {
  totalRevenue: 0,
  revenueThisWeek: 0,
  revenueThisMonth: 0,
  averageBookingValue: 0,
};

const Dashboard: FC = () => {
  const { token } = theme.useToken();
  const [userStats, setUserStats] = useState<UserApi>(emptyUserStats);
  const [bookingStats, setBookingStats] = useState<BookingApi>(emptyBookingStats);
  const [revenueStats, setRevenueStats] = useState<RevenueApi>(emptyRevenueStats);
  const [topMovies, setTopMovies] = useState<TopMovieApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userStatsRes, bookingStatsRes, revenueStatsRes, topMoviesRes] = await Promise.all([
          axiosInstance.get('/api/dashboard/user-statistics'),
          axiosInstance.get('/api/dashboard/booking-statistics'),
          axiosInstance.get('/api/dashboard/revenue-analytics'),
          axiosInstance.get('/api/dashboard/top-movies'),
        ]);

        if (!mounted) return;

        setUserStats((userStatsRes.data?.data ?? emptyUserStats) as UserApi);
        setBookingStats((bookingStatsRes.data?.data ?? emptyBookingStats) as BookingApi);
        setRevenueStats((revenueStatsRes.data?.data ?? emptyRevenueStats) as RevenueApi);
        setTopMovies((topMoviesRes.data?.data ?? []) as TopMovieApi[]);
      } catch {
        if (!mounted) return;

        setUserStats(emptyUserStats);
        setBookingStats(emptyBookingStats);
        setRevenueStats(emptyRevenueStats);
        setTopMovies([]);
        setError('Unable to load dashboard data.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}>
      <Title level={2} style={{ marginBottom: '24px', marginTop: 0 }}><DashboardOutlined /> Dashboard</Title>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        <TeamOutlined style={{ marginRight: 8 }} /> User Statistics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Users" value={userStats.totalUsers} icon={<UserOutlined />} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="Active Users" value={userStats.activeUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="Inactive Users" value={userStats.inactiveUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorError }} loading={loading} /></Col>
      </Row>

      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <UnorderedListOutlined style={{ marginRight: 8 }} /> Bookings
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Bookings" value={bookingStats.totalBookings} suffix="bookings" loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={bookingStats.bookingsThisWeek} suffix="bookings" loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={bookingStats.bookingsThisMonth} suffix="bookings" loading={loading} /></Col>
      </Row>


      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <DollarOutlined style={{ marginRight: 8 }} /> Revenue Analytics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Revenue" value={revenueStats.totalRevenue} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={revenueStats.revenueThisWeek} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={revenueStats.revenueThisMonth} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
      </Row>

      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <TrophyOutlined style={{ marginRight: 8 }} /> Top Movies by Bookings
      </Title>
      <Card bordered={false}>
        <Table dataSource={topMovies} columns={movieColumns} rowKey="movieId" pagination={false} scroll={{ x: true }} loading={loading} />
      </Card>
    </div>
  );
};

export default Dashboard;
