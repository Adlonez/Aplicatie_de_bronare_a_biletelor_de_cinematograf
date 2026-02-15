import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, UnorderedListOutlined, TrophyOutlined } from '@ant-design/icons';
import adminDataJson from '../../_mock/adminData.json';

const Dashboard: React.FC = () => {
  const stats = adminDataJson.statistics;
  const topMovies = adminDataJson.topMovies;

  const movieColumns = [
    { title: 'Movie Title', dataIndex: 'title' },
    { title: 'Tickets Sold', dataIndex: 'ticketsSold' },
    { title: 'Revenue', dataIndex: 'revenue', render: (val: number) => `$${val.toFixed(2)}` },
  ];

  const StatCard = ({ title, value, icon, precision, valueStyle, suffix }: any) => (
    <Card>
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
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>

      <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>
        <TeamOutlined /> User Statistics
      </h2>
      <Row gutter={16}>
        <Col span={8}><StatCard title="Total Users" value={stats.totalUsers} icon={<UserOutlined />} /></Col>
        <Col span={8}><StatCard title="Active Users" value={stats.activeUsers} icon={<UserOutlined />} valueStyle={{ color: '#3f8600' }} /></Col>
        <Col span={8}><StatCard title="Inactive Users" value={stats.inactiveUsers} icon={<UserOutlined />} valueStyle={{ color: '#cf1322' }} /></Col>
      </Row>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>
        <UnorderedListOutlined /> Ticket Sales
      </h2>
      <Row gutter={16}>
        <Col span={8}><StatCard title="Today" value={stats.ticketsSoldToday} suffix="tickets" /></Col>
        <Col span={8}><StatCard title="This Week" value={stats.ticketsSoldThisWeek} suffix="tickets" /></Col>
        <Col span={8}><StatCard title="This Month" value={stats.ticketsSoldThisMonth} suffix="tickets" /></Col>
      </Row>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>
        <DollarOutlined /> Revenue Analytics
      </h2>
      <Row gutter={16}>
        <Col span={8}><StatCard title="Today" value={stats.revenueToday} precision={2} icon="$" valueStyle={{ color: '#3f8600' }} /></Col>
        <Col span={8}><StatCard title="This Week" value={stats.revenueThisWeek} precision={2} icon="$" valueStyle={{ color: '#3f8600' }} /></Col>
        <Col span={8}><StatCard title="This Month" value={stats.revenueThisMonth} precision={2} icon="$" valueStyle={{ color: '#3f8600' }} /></Col>
      </Row>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>
        <TrophyOutlined /> Top Movies by Tickets Sold
      </h2>
      <Card>
        <Table dataSource={topMovies} columns={movieColumns} rowKey="movieId" pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;
