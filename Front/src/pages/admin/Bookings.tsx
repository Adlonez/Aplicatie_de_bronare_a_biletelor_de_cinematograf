import { useState, type FC } from 'react';
import { Table, Button, Tag, message, Space, Popover, Tooltip, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import bookingsDataJson from '../../_mock/bookings.json';
import filmsDataJson from '../../_mock/films.json';
import hallsDataJson from '../../_mock/halls.json';
import type { Booking } from '../../types/ui';
import { dateRangeFilter, timeRangeFilter, sliderRangeFilter, textSearchFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const statusColor = (status: string) => (status === 'bought' ? 'red' : 'orange');

const Bookings: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(bookingsDataJson as Booking[]);

  const cancelBooking = (id: number) => {
    setBookings(prev => prev.map((b) => (b.id === id ? { ...b, deleted: true } : b)));
    message.success('Booking cancelled');
  };

  const restoreBooking = (id: number) => {
    setBookings(prev => prev.map((b) => (b.id === id ? { ...b, deleted: false } : b)));
    message.success('Booking restored');
  };

  const columns: ColumnType<Booking>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Title',
      dataIndex: 'movieTitle',
      sorter: (a, b) => a.movieTitle.localeCompare(b.movieTitle),
      filters: filmsDataJson.map((f) => ({ text: f.title, value: f.title })),
      filterSearch: true,
      filterDropdownProps: { overlayStyle: { width: 250 } },
      onFilter: (value, record) => record.movieTitle === value,
      render: (text: string, b: Booking) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {b.deleted && <Tag color="red">Cancelled</Tag>}
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'customerName',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      ...textSearchFilter<Booking>((r) => r.customerName),
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      sorter: (a, b) => a.customerEmail.localeCompare(b.customerEmail),
      ...textSearchFilter<Booking>((r) => r.customerEmail),
    },
    {
      title: 'Phone',
      dataIndex: 'customerPhone',
      sorter: (a, b) => a.customerPhone.localeCompare(b.customerPhone),
      ...textSearchFilter<Booking>((r) => r.customerPhone),
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      sorter: (a, b) => a.hall.localeCompare(b.hall),
      filters: hallsDataJson.map((h) => ({ text: h.name, value: h.name })),
      onFilter: (value, record) => record.hall === value,
      render: (hall: string) => <Tag color="blue">{hall}</Tag>,
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      render: (seats: string[]) => seats.join(', '),
      ...textSearchFilter<Booking>((r) => r.seats.join(', ')),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>,
      filters: [{ text: 'Bought', value: 'bought' }, { text: 'Booked', value: 'booked' }],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Showtime Date',
      dataIndex: 'showtime',
      sorter: (a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime(),
      render: (s: string) => s.split(' ')[0],
      ...dateRangeFilter<Booking>((r) => r.showtime.split(' ')[0]),
    },
    {
      title: 'Showtime Time',
      dataIndex: 'showtime',
      render: (s: string) => s.split(' ')[1],
      ...timeRangeFilter<Booking>((r) => r.showtime.split(' ')[1]),
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (price: number) => `$${price.toFixed(2)}`,
      ...sliderRangeFilter<Booking>((r) => r.totalPrice, 0, 200),
    },
    {
      title: 'Actions',
      render: (_: any, b: Booking) => (
        <Space>
          {b.deleted ? (
            <Button type="primary" onClick={() => restoreBooking(b.id)} size="small">Restore</Button>
          ) : (
            <Popconfirm title="Cancel this booking?" onConfirm={() => cancelBooking(b.id)} okText="Yes" cancelText="No">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small">Cancel</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><BookOutlined /> Booking & Ticket Management</Title>
        <Popover
          title="Status Legend"
          content={
            <Space direction="vertical">
              <div><Tag color="red">BOUGHT</Tag> = Paid</div>
              <div><Tag color="orange">BOOKED</Tag> = Reserved</div>
            </Space>
          }
        >
          <Button icon={<InfoCircleOutlined />}>Status Info</Button>
        </Popover>
      </div>

      <Table dataSource={sortDeletedLast(bookings)} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} />
    </div>
  );
};

export default Bookings;
