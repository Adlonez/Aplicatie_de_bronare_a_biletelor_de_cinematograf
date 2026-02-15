import React, { useState } from 'react';
import { Table, Button, Tag, Input, message, Modal } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import bookingsDataJson from '../../_mock/bookings.json';

interface Booking {
  id: number;
  movieId: number;
  movieTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hall: string;
  seats: string[];
  status: 'bought' | 'booked';
  bookingDate: string;
  showtime: string;
  totalPrice: number;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(bookingsDataJson as Booking[]);
  const [searchText, setSearchText] = useState('');

  const filteredBookings = bookings.filter((booking) =>
    searchText === '' ||
    booking.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.customerEmail.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.customerPhone.includes(searchText)
  );

  const cancelBooking = (id: number) => {
    Modal.confirm({
      title: 'Cancel this booking?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setBookings(bookings.filter((b) => b.id !== id));
        message.success('Booking cancelled');
      },
    });
  };

  const statusColor = (status: string) => status === 'bought' ? 'red' : 'orange';

  const columns: ColumnType<Booking>[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Movie', dataIndex: 'movieTitle' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Email', dataIndex: 'customerEmail' },
    { title: 'Phone', dataIndex: 'customerPhone' },
    { title: 'Hall', dataIndex: 'hall' },
    { title: 'Seats', dataIndex: 'seats', render: (seats: string[]) => seats.join(', ') },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>,
      filters: [
        { text: 'Bought', value: 'bought' },
        { text: 'Booked', value: 'booked' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    { title: 'Showtime', dataIndex: 'showtime' },
    { title: 'Price', dataIndex: 'totalPrice', render: (price: number) => `$${price.toFixed(2)}` },
    {
      title: 'Actions',
      render: (_: any, booking: Booking) => (
        <Button type="primary" danger icon={<DeleteOutlined />} size="small" onClick={() => cancelBooking(booking.id)}>
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '16px' }}>Booking & Ticket Management</h1>
      <Input
        placeholder="Search by customer name, email, or phone"
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 400, marginBottom: '8px' }}
        allowClear
      />
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#888' }}>
        <Tag color="red">BOUGHT</Tag> = Paid | <Tag color="orange">BOOKED</Tag> = Reserved
      </div>
      <Table dataSource={filteredBookings} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} />
    </div>
  );
};

export default Bookings;
