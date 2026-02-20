import React from 'react';
import { Card, Row, Col, Statistic, Table, theme, Typography } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, UnorderedListOutlined, TrophyOutlined } from '@ant-design/icons';
import adminDataJson from '../../_mock/adminData.json';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const stats = adminDataJson.statistics;
  const topMovies = adminDataJson.topMovies;

  const movieColumns = [
    { title: 'Movie Title', dataIndex: 'title' },
    { title: 'Tickets Sold', dataIndex: 'ticketsSold' },
    { title: 'Revenue', dataIndex: 'revenue', render: (val: number) => `$${val.toFixed(2)}` },
  ];

  const StatCard = ({ title, value, icon, precision, valueStyle, suffix }: any) => (
    <Card bordered={false} style={{ height: '100%' }}>
      <Statistic 
        title={title} 
        value={value} 
        prefix={icon} 
        precision={precision} 
        valueStyle={valueStyle}
        suffix={suffix}
      />
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', marginTop: 0 }}>Dashboard</Title>

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
