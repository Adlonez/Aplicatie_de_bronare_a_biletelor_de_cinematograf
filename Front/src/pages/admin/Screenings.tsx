import { useState, type FC } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Space, message, Popconfirm, Tag, Popover, Tooltip, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import screeningsDataJson from '../../_mock/screenings.json';
import filmsDataJson from '../../_mock/films.json';
import hallsDataJson from '../../_mock/halls.json';
import bookingsDataJson from '../../_mock/bookings.json';
import SeatMapModal from '../../components/admin/SeatMapModal';
import type { Screening, Booking, Hall } from '../../types/ui';
import { dateRangeFilter, timeRangeFilter, sortDeletedLast } from '../../components/admin/shared/tableFilters';

const { Title } = Typography;

const movies = filmsDataJson as { id: number; title: string }[];
const halls = hallsDataJson as Hall[];

const Screenings: FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>(screeningsDataJson as Screening[]);
  const [bookings, setBookings] = useState<Booking[]>(bookingsDataJson as Booking[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [editing, setEditing] = useState<Screening | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [form] = Form.useForm();

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

  const saveScreening = () => {
    form.validateFields().then((values) => {
      const movie = movies.find((m) => m.id === values.movieId);
      const dateStr = values.date.format('YYYY-MM-DD');
      const timeStr = values.time.format('HH:mm');
      const data: Screening = {
        id: editing?.id || Date.now(),
        movieId: values.movieId,
        movieTitle: movie?.title || '',
        hall: values.hall,
        date: dateStr,
        time: timeStr,
        deleted: editing?.deleted,
      };

      const conflict = screenings.find(
        (s) => !s.deleted && s.id !== data.id && s.hall === data.hall && s.date === data.date && s.time === data.time,
      );

      const doSave = () => {
        if (editing) {
          setScreenings(prev => prev.map((s) => (s.id === editing.id ? data : s)));
          message.success('Screening updated');
        } else {
          setScreenings(prev => [...prev, data]);
          message.success('Screening added');
        }
        setModalOpen(false);
        form.resetFields();
      };

      if (conflict) {
        Modal.confirm({
          title: 'Schedule Conflict',
          content: `"${conflict.movieTitle}" is already scheduled in ${data.hall} at ${data.time} on ${data.date}. Save anyway?`,
          okText: 'Save Anyway',
          okType: 'danger',
          onOk: doSave,
        });
      } else {
        doSave();
      }
    });
  };

  const deleteScreening = (id: number) => {
    const screening = screenings.find((s) => s.id === id);
    if (!screening) return;

    const activeBookings = bookings.filter(
      (b) => !b.deleted && b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === `${screening.date} ${screening.time}`,
    );

    const doDelete = () => {
      setScreenings(prev => prev.map((s) => s.id === id ? { ...s, deleted: true } : s));
      message.success('Screening marked as deleted');
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

  const restoreScreening = (id: number) => {
    setScreenings(prev => prev.map((s) => s.id === id ? { ...s, deleted: false } : s));
    message.success('Screening restored');
  };

  const columns: ColumnType<Screening>[] = [
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
      render: (_: any, s: Screening) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => { setSelectedScreening(s); setSeatMapOpen(true); }} disabled={s.deleted}>Seats</Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openModal(s)} disabled={s.deleted}>Edit</Button>
          {s.deleted ? (
            <Button type="primary" onClick={() => restoreScreening(s.id)} size="small">Restore</Button>
          ) : (
            <Popconfirm title="Delete this screening?" onConfirm={() => deleteScreening(s.id)} okText="Yes" cancelText="No">
              <Button type="primary" danger icon={<DeleteOutlined />} size="small">Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2} style={{ margin: 0 }}><CalendarOutlined /> Screening Schedule</Title>
        <Space>
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

      <Table dataSource={sortDeletedLast(screenings)} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

      {/* Screening Form Modal */}
      <Modal title={editing ? 'Edit Screening' : 'Add Screening'} open={modalOpen} onOk={saveScreening} onCancel={() => setModalOpen(false)} width={500}>
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
