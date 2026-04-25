import { useEffect, useState, type FC } from 'react';
import { Table, Button, Tag, message, Space, Popover, Tooltip, Popconfirm, Typography, Select } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, BookOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import axiosInstance from '../../api/axiosInstance';
import type { Booking, Films, Hall } from '../../types/ui';
import { dateRangeFilter, timeRangeFilter, sliderRangeFilter, textSearchFilter, seatsFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const statusColor = (status: string) => (status === 'bought' ? 'red' : 'orange');

const Bookings: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [films, setFilms] = useState<Films[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, filmsRes, hallsRes] = await Promise.all([
        axiosInstance.get('/api/bookings/list'),
        axiosInstance.get('/api/films/list'),
        axiosInstance.get('/api/halls/list'),
      ]);

      setBookings((bookingsRes.data?.data ?? []) as Booking[]);
      setFilms((filmsRes.data?.data ?? []) as Films[]);
      setHalls((hallsRes.data?.data ?? []) as Hall[]);
    } catch {
      setBookings([]);
      setFilms([]);
      setHalls([]);
      message.error('Unable to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingData();
  }, []);

  const changeBookingStatus = async (id: number, status: Booking['status']) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/api/bookings/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.success('Booking status updated');
      await loadBookingData();
    } catch {
      message.error('Unable to update booking status');
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/bookings/${id}`);
      message.success('Booking deleted');
      await loadBookingData();
    } catch {
      message.error('Unable to delete booking');
    } finally {
      setLoading(false);
    }
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
      filters: films.map((f) => ({ text: f.title, value: f.title })),
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
      filters: halls.map((h) => ({ text: h.name, value: h.name })),
      onFilter: (value, record) => record.hall === value,
      render: (hall: string) => <Tag color="blue">{hall}</Tag>,
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      render: (seats: string[]) => seats.join(', '),
      ...seatsFilter<Booking>((r) => r.seats),
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
      render: (s: string) => s?.split(' ')[0] ?? '',
      ...dateRangeFilter<Booking>((r) => r.showtime?.split(' ')[0] ?? ''),
    },
    {
      title: 'Showtime Time',
      dataIndex: 'showtime',
      render: (s: string) => s?.split(' ')[1] ?? '',
      ...timeRangeFilter<Booking>((r) => r.showtime?.split(' ')[1] ?? ''),
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
      render: (_: unknown, b: Booking) => (
        <Space>
          <Select
            value={b.status}
            size="small"
            style={{ width: 112 }}
            disabled={b.deleted}
            options={[{ value: 'booked', label: 'Booked' }, { value: 'bought', label: 'Bought' }]}
            onChange={(status) => changeBookingStatus(b.id, status)}
          />
          <Popconfirm title="Delete this booking?" onConfirm={() => deleteBooking(b.id)} okText="Yes" cancelText="No" disabled={b.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" disabled={b.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (

    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><BookOutlined /> Booking & Ticket Management</Title>
        <Space>
          <Button icon={<ClearOutlined />} onClick={() => setTableKey(k => k + 1)}>Reset All Filters</Button>
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
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table key={tableKey} dataSource={sortDeletedLast(bookings)} columns={columns} rowKey="id" pagination={false} scroll={{ x: 1200, y: 'calc(100vh - 310px)' }} loading={loading} />
      </div>
    </div>
  );
};

export default Bookings;
