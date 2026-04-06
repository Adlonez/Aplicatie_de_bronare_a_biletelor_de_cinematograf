import { useEffect, useMemo, useState, type FC, type ReactNode, type CSSProperties } from 'react';
import { Card, Row, Col, Statistic, Table, theme, Typography } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, UnorderedListOutlined, TrophyOutlined, DashboardOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosInstance';

const { Title } = Typography;

const movieColumns = [
  { title: 'Movie Title', dataIndex: 'title' },
  { title: 'Tickets Sold', dataIndex: 'ticketsSold' },
  { title: 'Revenue', dataIndex: 'revenue', render: (val: number) => `$${val.toFixed(2)}` },
];

const StatCard = ({ title, value, icon, precision, valueStyle, suffix }: { title: string; value: number | string; icon?: ReactNode; precision?: number; valueStyle?: CSSProperties; suffix?: string }) => (
  <Card bordered={false} style={{ height: '100%' }}>
    <Statistic title={title} value={value} prefix={icon} precision={precision} valueStyle={valueStyle} suffix={suffix} />
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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [usersRes, bookingsRes, filmsRes] = await Promise.all([
          axiosInstance.get('/api/users/list'),
          axiosInstance.get('/api/bookings/list'),
          axiosInstance.get('/api/films/list'),
        ]);

        setUsers((usersRes.data?.data ?? []) as UserApi[]);
        setBookings((bookingsRes.data?.data ?? []) as BookingApi[]);
        setFilms((filmsRes.data?.data ?? []) as FilmApi[]);
      } catch {
        setUsers([]);
        setBookings([]);
        setFilms([]);
      }
    };

    loadDashboardData();
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
      ticketsSoldToday: activeBookingsList.length,
      ticketsSoldThisWeek: bookingsThisWeek.length,
      ticketsSoldThisMonth: bookingsThisMonth.length,
      revenueToday: totalRevenue,
      revenueThisWeek: bookingsThisWeek.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
      revenueThisMonth: bookingsThisMonth.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    };
  }, [users, bookings]);

  const topMovies = useMemo(() => {
    const filmTitleById = new Map<number, string>();
    films.filter((f) => !f.deleted).forEach((film) => filmTitleById.set(film.id, film.title));

    const movieStats = new Map<number, { movieId: number; title: string; ticketsSold: number; revenue: number }>();

    bookings
      .filter((booking) => !booking.deleted)
      .forEach((booking) => {
        const current = movieStats.get(booking.movieId);
        if (current) {
          current.ticketsSold += 1;
          current.revenue += Number(booking.totalPrice || 0);
          return;
        }

        movieStats.set(booking.movieId, {
          movieId: booking.movieId,
          title: filmTitleById.get(booking.movieId) || booking.movieTitle || `Film #${booking.movieId}`,
          ticketsSold: 1,
          revenue: Number(booking.totalPrice || 0),
        });
      });

    return Array.from(movieStats.values()).sort((a, b) => b.ticketsSold - a.ticketsSold);
  }, [bookings, films]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}>
      <Title level={2} style={{ marginBottom: '24px', marginTop: 0 }}><DashboardOutlined /> Dashboard</Title>


      <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        <TeamOutlined style={{ marginRight: 8 }} /> User Statistics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Total Users" value={stats.totalUsers} icon={<UserOutlined />} /></Col>
        <Col xs={24} sm={8}><StatCard title="Active Users" value={stats.activeUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorSuccess }} /></Col>
        <Col xs={24} sm={8}><StatCard title="Inactive Users" value={stats.inactiveUsers} icon={<UserOutlined />} valueStyle={{ color: token.colorError }} /></Col>
      </Row>

      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <UnorderedListOutlined style={{ marginRight: 8 }} /> Ticket Sales
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Today" value={stats.ticketsSoldToday} suffix="tickets" /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={stats.ticketsSoldThisWeek} suffix="tickets" /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={stats.ticketsSoldThisMonth} suffix="tickets" /></Col>
      </Row>


      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <DollarOutlined style={{ marginRight: 8 }} /> Revenue Analytics
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="Today" value={stats.revenueToday} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Week" value={stats.revenueThisWeek} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} /></Col>
        <Col xs={24} sm={8}><StatCard title="This Month" value={stats.revenueThisMonth} precision={2} icon="$" valueStyle={{ color: token.colorSuccess }} /></Col>
      </Row>

      <Title level={4} style={{ marginTop: '32px', marginBottom: '16px' }}>
        <TrophyOutlined style={{ marginRight: 8 }} /> Top Movies by Tickets Sold
      </Title>
      <Card bordered={false}>
        <Table dataSource={topMovies} columns={movieColumns} rowKey="movieId" pagination={false} scroll={{ x: true }} />
      </Card>
    </div>
  );
};

export default Dashboard;
