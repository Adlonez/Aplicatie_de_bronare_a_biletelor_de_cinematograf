import { useEffect, useMemo, useState, type FC, type ReactNode, type CSSProperties } from 'react';
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
  id: number;
  status?: string;
  deleted?: boolean;
}

interface BookingApi {
  id: number;
  movieId: number;
  movieTitle?: string;
  bookingDate?: string;
  totalPrice?: number;
  deleted?: boolean;
}

interface FilmApi {
  id: number;
  title: string;
  deleted?: boolean;
}

const Dashboard: FC = () => {
  const { token } = theme.useToken();
  const [users, setUsers] = useState<UserApi[]>([]);
  const [bookings, setBookings] = useState<BookingApi[]>([]);
  const [films, setFilms] = useState<FilmApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, bookingsRes, filmsRes] = await Promise.all([
          axiosInstance.get('/api/users/list'),
          axiosInstance.get('/api/bookings/list'),
          axiosInstance.get('/api/films/list'),
        ]);

        if (!mounted) return;

        setUsers((usersRes.data?.data ?? []) as UserApi[]);
        setBookings((bookingsRes.data?.data ?? []) as BookingApi[]);
        setFilms((filmsRes.data?.data ?? []) as FilmApi[]);
      } catch {
        if (!mounted) return;

        setUsers([]);
        setBookings([]);
        setFilms([]);
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

  const stats = useMemo(() => {
    const now = new Date();
    const weekOffset = (now.getDay() + 6) % 7;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - weekOffset);

    const activeUsersList = users.filter((u) => !u.deleted);
    const activeBookingsList = bookings.filter((b) => !b.deleted);

    const parseDate = (value?: string) => {
      if (!value) return null;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const bookingsThisWeek = activeBookingsList.filter((booking) => {
      const bookingDate = parseDate(booking.bookingDate);
      return bookingDate ? bookingDate >= startOfWeek : false;
    });

    const bookingsThisMonth = activeBookingsList.filter((booking) => {
      const bookingDate = parseDate(booking.bookingDate);
      return bookingDate
        ? bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear()
        : false;
    });

    const activeUsers = activeUsersList.filter((user) => (user.status || '').toLowerCase() === 'active').length;
    const totalRevenue = activeBookingsList.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

    return {
      totalUsers: activeUsersList.length,
      activeUsers,
      inactiveUsers: activeUsersList.length - activeUsers,
      totalBookings: activeBookingsList.length,
      bookingsThisWeek: bookingsThisWeek.length,
      bookingsThisMonth: bookingsThisMonth.length,
      totalRevenue,
      revenueThisWeek: bookingsThisWeek.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
      revenueThisMonth: bookingsThisMonth.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    };
  }, [users, bookings]);

  const topMovies = useMemo(() => {
    const filmTitleById = new Map<number, string>();
    films.filter((f) => !f.deleted).forEach((film) => filmTitleById.set(film.id, film.title));

    const movieStats = new Map<number, { movieId: number; title: string; bookingCount: number; revenue: number }>();

    bookings
      .filter((booking) => !booking.deleted)
      .forEach((booking) => {
        const current = movieStats.get(booking.movieId);
        if (current) {
          current.bookingCount += 1;
          current.revenue += Number(booking.totalPrice || 0);
          return;
        }

        movieStats.set(booking.movieId, {
          movieId: booking.movieId,
          title: filmTitleById.get(booking.movieId) || booking.movieTitle || `Film #${booking.movieId}`,
          bookingCount: 1,
          revenue: Number(booking.totalPrice || 0),
        });
      });

    return Array.from(movieStats.values()).sort((a, b) => b.bookingCount - a.bookingCount);
  }, [bookings, films]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}>
      <Title level={2} style={{ marginBottom: '24px', marginTop: 0 }}><DashboardOutlined /> Dashboard</Title>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        <TeamOutlined style={{ marginRight: 8 }} /> User Statistics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Users" value={stats.totalUsers} icon={<UserOutlined />} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="Active Users" value={stats.activeUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="Inactive Users" value={stats.inactiveUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorError }} loading={loading} /></Col>
      </Row>

      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <UnorderedListOutlined style={{ marginRight: 8 }} /> Bookings
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Bookings" value={stats.totalBookings} suffix="bookings" loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={stats.bookingsThisWeek} suffix="bookings" loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={stats.bookingsThisMonth} suffix="bookings" loading={loading} /></Col>
      </Row>


      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <DollarOutlined style={{ marginRight: 8 }} /> Revenue Analytics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Revenue" value={stats.totalRevenue} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={stats.revenueThisWeek} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={stats.revenueThisMonth} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} loading={loading} /></Col>
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
