import { useEffect, useState, type FC } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Space, message, Popconfirm, Tag, Popover, Tooltip, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, EyeOutlined, InfoCircleOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axiosInstance';
import SeatMapModal from '../../components/admin/SeatMapModal';
import type { Screening, Booking, Hall, Films } from '../../types/ui';
import { dateRangeFilter, timeRangeFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

type ScreeningFormValues = {
  movieId: number;
  hall: string;
  date: dayjs.Dayjs;
  time: dayjs.Dayjs;
};

type ScreeningPayload = {
  movieId: number;
  movieTitle: string;
  hall: string;
  date: string;
  time: string;
};

const Screenings: FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Films[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [editing, setEditing] = useState<Screening | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [form] = Form.useForm();
  const [tableKey, setTableKey] = useState(0);

  const loadScreeningData = async () => {
    try {
      setLoading(true);
      const [screeningsRes, filmsRes, hallsRes, bookingsRes] = await Promise.all([
        axiosInstance.get('/api/screenings/list'),
        axiosInstance.get('/api/films/list'),
        axiosInstance.get('/api/halls/list'),
        axiosInstance.get('/api/bookings/list'),
      ]);

      setScreenings((screeningsRes.data?.data ?? []) as Screening[]);
      setMovies((filmsRes.data?.data ?? []) as Films[]);
      setHalls((hallsRes.data?.data ?? []) as Hall[]);
      setBookings((bookingsRes.data?.data ?? []) as Booking[]);
    } catch {
      setScreenings([]);
      setMovies([]);
      setHalls([]);
      setBookings([]);
      message.error('Unable to load screenings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScreeningData();
  }, []);

  const openModal = (screening?: Screening) => {
    setEditing(screening || null);
    if (screening) {
      form.setFieldsValue({
        movieId: screening.movieId,
        hall: screening.hall,
        date: dayjs(screening.date),
        time: dayjs(screening.time, 'HH:mm'),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const saveScreening = async () => {
    try {
      const values = await form.validateFields() as ScreeningFormValues;
      const movie = movies.find((m) => m.id === values.movieId);
      const dateStr = values.date.format('YYYY-MM-DD');
      const timeStr = values.time.format('HH:mm');
      const payload: ScreeningPayload = {
        movieId: values.movieId,
        movieTitle: movie?.title || '',
        hall: values.hall,
        date: dateStr,
        time: timeStr,
      };

      const conflict = screenings.find(
        (s) => !s.deleted && s.id !== editing?.id && s.hall === payload.hall && s.date === payload.date && s.time === payload.time,
      );

      const doSave = async () => {
        try {
          setSaving(true);
          if (editing) {
            await axiosInstance.put(`/api/screenings/${editing.id}`, payload);
            message.success('Screening updated');
          } else {
            await axiosInstance.post('/api/screenings/create', payload);
            message.success('Screening added');
          }
          setModalOpen(false);
          form.resetFields();
          await loadScreeningData();
        } catch {
          message.error('Unable to save screening');
        } finally {
          setSaving(false);
        }
      };

      if (conflict) {
        Modal.confirm({
          title: 'Schedule Conflict',
          content: `"${conflict.movieTitle}" is already scheduled in ${payload.hall} at ${payload.time} on ${payload.date}. Save anyway?`,
          okText: 'Save Anyway',
          okType: 'danger',
          onOk: doSave,
        });
      } else {
        await doSave();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('Unable to save screening');
    }
  };

  const deleteScreening = (id: number) => {
    const screening = screenings.find((s) => s.id === id);
    if (!screening) return;

    const activeBookings = bookings.filter(
      (b) => !b.deleted && b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === `${screening.date} ${screening.time}`,
    );

    const doDelete = async () => {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/screenings/${id}`);
        message.success('Screening deleted');
        await loadScreeningData();
      } catch {
        message.error('Unable to delete screening');
      } finally {
        setLoading(false);
      }
    };

    if (activeBookings.length > 0) {
      Modal.confirm({
        title: 'Active Bookings Found',
        content: `This screening has ${activeBookings.length} active booking(s). Deleting will not cancel them. Continue?`,
        okText: 'Delete Anyway',
        okType: 'danger',
        onOk: doDelete,
      });
    } else {
      doDelete();
    }
  };

  const columns: ColumnType<Screening>[] = [
    {
      title: 'Image',
      key: 'image',
      width: 100,
      render: (_: unknown, s: Screening) => {
        const movie = movies.find(m => m.title === s.movieTitle);
        if (movie?.image) {
          return <img src={movie.image} alt={s.movieTitle} style={{ width: 60, height: 80, objectFit: 'cover' }} />;
        }
        return <div style={{ width: 60, height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>;
      }
    },
    {
      title: 'Title',
      dataIndex: 'movieTitle',
      render: (text: string, s: Screening) => (
        <Space>
          <Tooltip title={text}>
            <div style={{ minWidth: 120 }}>{text}</div>
          </Tooltip>
          {s.deleted && <Tag color="red">Deleted</Tag>}
        </Space>
      ),
      filters: movies.map((m) => ({ text: m.title, value: m.title })),
      filterSearch: true,
      filterDropdownProps: { overlayStyle: { width: 250 } },

      onFilter: (value, record) => record.movieTitle === (value as string),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date),
      ...dateRangeFilter<Screening>((r) => r.date),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      sorter: (a, b) => a.time.localeCompare(b.time),
      ...timeRangeFilter<Screening>((r) => r.time),
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      render: (hall: string) => <Tag color="blue">{hall}</Tag>,
      filters: halls.map((h) => ({ text: h.name, value: h.name })),
      onFilter: (value, record) => record.hall === (value as string),
    },
    {
      title: 'Actions',
      render: (_: unknown, s: Screening) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => { setSelectedScreening(s); setSeatMapOpen(true); }} disabled={s.deleted}>Seats</Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(s)} disabled={s.deleted}>Edit</Button>
          <Popconfirm title="Delete this screening?" onConfirm={() => deleteScreening(s.id)} okText="Yes" cancelText="No" disabled={s.deleted}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" disabled={s.deleted}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><CalendarOutlined /> Screening Schedule</Title>
        <Space>
          <Button icon={<ClearOutlined />} onClick={() => setTableKey(k => k + 1)}>Reset All Filters</Button>
          <Popover
            title="Available Halls"
            content={
              <Space direction="vertical">
                {halls.map((h) => (
                  <Tag key={h.id} color="blue">{h.name} - Capacity: {h.capacity} - {h.features.join(', ')}</Tag>
                ))}
              </Space>
            }
          >
            <Button icon={<InfoCircleOutlined />}>Halls Info</Button>
          </Popover>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Screening</Button>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Table key={tableKey} dataSource={sortDeletedLast(screenings)} columns={columns} rowKey="id" pagination={false} scroll={{ y: 'calc(100vh - 310px)' }} loading={loading} />
      </div>

      {/* Screening Form Modal */}
      <Modal title={editing ? 'Edit Screening' : 'Add Screening'} open={modalOpen} onOk={saveScreening} confirmLoading={saving} onCancel={() => setModalOpen(false)} width={500}>
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="movieId" label="Movie" rules={[{ required: true, message: 'Select movie' }]}>
                <Select placeholder="Select movie" options={movies.map((m) => ({ value: m.id, label: m.title }))} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="hall" label="Hall" rules={[{ required: true, message: 'Select hall' }]}>
                <Select placeholder="Select hall" options={halls.map((h) => ({ value: h.name, label: `${h.name} (${h.capacity})` }))} />
              </Form.Item>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Select date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Select time' }]}>
                <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Seat Map + Booking Modal */}
      <SeatMapModal
        screening={selectedScreening}
        halls={halls}
        bookings={bookings}
        onBookingsChange={setBookings}
        open={seatMapOpen}
        onClose={() => setSeatMapOpen(false)}
      />
    </div>
  );
};

export default Screenings;
