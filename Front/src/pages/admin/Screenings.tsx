import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Space, message, Popconfirm, Tag, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import screeningsDataJson from '../../_mock/screenings.json';
import filmsDataJson from '../../_mock/films.json';
import hallsDataJson from '../../_mock/halls.json';
import bookingsDataJson from '../../_mock/bookings.json';
import SeatMap from '../../components/admin/SeatMap';
import dayjs from 'dayjs';

interface Screening {
  id: number;
  movieId: number;
  movieTitle: string;
  hall: string;
  date: string;
  time: string;
}

interface Movie {
  id: number;
  title: string;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
  features: string[];
  seatMap: {
    rows: Array<{
      row: string;
      seats: number[];
    }>;
  };
}

interface Booking {
  id: number;
  movieId: number;
  movieTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hall: string;
  seats: string[];
  status: string;
  bookingDate: string;
  showtime: string;
  totalPrice: number;
}

const Screenings: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>(screeningsDataJson as Screening[]);
  const [movies] = useState<Movie[]>(filmsDataJson as Movie[]);
  const [halls] = useState<Hall[]>(hallsDataJson as Hall[]);
  const [bookings, setBookings] = useState<Booking[]>(bookingsDataJson as Booking[]);
  
  const [screeningModalOpen, setScreeningModalOpen] = useState(false);
  const [seatMapModalOpen, setSeatMapModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  const [form] = Form.useForm();
  const [bookingForm] = Form.useForm();

  const openScreeningModal = (screening?: Screening) => {
    setEditingScreening(screening || null);
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
    setScreeningModalOpen(true);
  };

  const saveScreening = () => {
    form.validateFields().then((values) => {
      const movie = movies.find((m) => m.id === values.movieId);
      const screeningData: Screening = {
        id: editingScreening?.id || Date.now(),
        movieId: values.movieId,
        movieTitle: movie?.title || '',
        hall: values.hall,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
      };

      if (editingScreening) {
        setScreenings(screenings.map((s) => (s.id === editingScreening.id ? screeningData : s)));
        message.success('Screening updated');
      } else {
        setScreenings([...screenings, screeningData]);
        message.success('Screening added');
      }
      setScreeningModalOpen(false);
      form.resetFields();
    });
  };

  const deleteScreening = (id: number) => {
    setScreenings(screenings.filter((s) => s.id !== id));
    message.success('Screening deleted');
  };

  const openSeatMap = (screening: Screening) => {
    setSelectedScreening(screening);
    setSeatMapModalOpen(true);
  };

  const getScreeningSeats = (screening: Screening) => {
    const screeningDateTime = `${screening.date} ${screening.time}`;
    const relevantBookings = bookings.filter(
      (b) => b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === screeningDateTime
    );
    
    return {
      booked: relevantBookings.filter((b) => b.status === 'booked').flatMap((b) => b.seats),
      bought: relevantBookings.filter((b) => b.status === 'bought').flatMap((b) => b.seats),
    };
  };

  const openBookingModal = (seat: string) => {
    if (!selectedScreening) return;

    setSelectedSeat(seat);
    const screeningDateTime = `${selectedScreening.date} ${selectedScreening.time}`;
    
    const existingBooking = bookings.find(
      (b) => b.movieTitle === selectedScreening.movieTitle && b.hall === selectedScreening.hall &&
            b.showtime === screeningDateTime && b.seats.includes(seat)
    );

    if (existingBooking) {
      setEditingBooking(existingBooking);
      bookingForm.setFieldsValue({
        customerName: existingBooking.customerName,
        customerEmail: existingBooking.customerEmail,
        customerPhone: existingBooking.customerPhone,
        status: existingBooking.status,
        totalPrice: existingBooking.totalPrice,
      });
    } else {
      setEditingBooking(null);
      bookingForm.setFieldsValue({ status: 'booked', totalPrice: 14.00 });
    }
    
    setBookingModalOpen(true);
  };

  const saveBooking = () => {
    if (!selectedScreening || !selectedSeat) return;

    bookingForm.validateFields().then((values) => {
      const screeningDateTime = `${selectedScreening.date} ${selectedScreening.time}`;

      if (editingBooking) {
        setBookings(bookings.map(b => b.id === editingBooking.id ? { ...editingBooking, ...values } : b));
        message.success('Booking updated');
      } else {
        const newBooking: Booking = {
          id: Date.now(),
          movieId: selectedScreening.movieId,
          movieTitle: selectedScreening.movieTitle,
          ...values,
          hall: selectedScreening.hall,
          seats: [selectedSeat],
          bookingDate: new Date().toISOString().split('T')[0],
          showtime: screeningDateTime,
        };
        setBookings([...bookings, newBooking]);
        message.success('Booking created');
      }

      setBookingModalOpen(false);
      bookingForm.resetFields();
    });
  };

  const deleteBooking = () => {
    if (!editingBooking) return;

    Modal.confirm({
      title: 'Delete this booking?',
      content: 'This cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setBookings(bookings.filter(b => b.id !== editingBooking.id));
        message.success('Booking deleted');
        setBookingModalOpen(false);
        bookingForm.resetFields();
      },
    });
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', sorter: (a: Screening, b: Screening) => a.date.localeCompare(b.date) },
    { title: 'Time', dataIndex: 'time', sorter: (a: Screening, b: Screening) => a.time.localeCompare(b.time) },
    {
      title: 'Movie',
      dataIndex: 'movieTitle',
      filters: [...new Set(screenings.map(s => s.movieTitle))].map(title => ({ text: title, value: title })),
      onFilter: (value: any, record: Screening) => record.movieTitle === value,
    },
    {
      title: 'Hall',
      dataIndex: 'hall',
      render: (hall: string) => <Tag>{hall}</Tag>,
      filters: halls.map(h => ({ text: h.name, value: h.name })),
      onFilter: (value: any, record: Screening) => record.hall === value,
    },
    {
      title: 'Actions',
      render: (_: any, screening: Screening) => (
        <Space>
          <Button type="default" icon={<EyeOutlined />} size="small" onClick={() => openSeatMap(screening)}>
            Seats
          </Button>
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => openScreeningModal(screening)}>
            Edit
          </Button>
          <Popconfirm title="Delete this screening?" onConfirm={() => deleteScreening(screening.id)} okText="Yes" cancelText="No">
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const FormField = ({ name, label, required = true, children }: any) => (
    <Form.Item name={name} label={label} rules={required ? [{ required, message: `Select ${label.toLowerCase()}` }] : []}>
      {children}
    </Form.Item>
  );

  return (
    <div>
      <div>
        <h1><CalendarOutlined /> Screening Schedule</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openScreeningModal()}>
          Add Screening
        </Button>
      </div>

      <div>
        <h3>Available Halls:</h3>
        <Space wrap>
          {halls.map((hall) => (
            <Tag key={hall.id} color="blue">
              {hall.name} - Capacity: {hall.capacity} - {hall.features.join(', ')}
            </Tag>
          ))}
        </Space>
      </div>

      <Table dataSource={screenings} columns={columns} rowKey="id" />

      {/* Screening Modal */}
      <Modal
        title={editingScreening ? 'Edit Screening' : 'Add Screening'}
        open={screeningModalOpen}
        onOk={saveScreening}
        onCancel={() => setScreeningModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <FormField name="movieId" label="Movie">
            <Select placeholder="Select movie">
              {movies.map((movie) => (
                <Select.Option key={movie.id} value={movie.id}>{movie.title}</Select.Option>
              ))}
            </Select>
          </FormField>
          <FormField name="hall" label="Hall">
            <Select placeholder="Select hall">
              {halls.map((hall) => (
                <Select.Option key={hall.id} value={hall.name}>{hall.name} (Capacity: {hall.capacity})</Select.Option>
              ))}
            </Select>
          </FormField>
          <FormField name="date" label="Date">
            <DatePicker />
          </FormField>
          <FormField name="time" label="Time">
            <TimePicker format="HH:mm" />
          </FormField>
        </Form>
      </Modal>

      {/* Seat Map Modal */}
      <Modal
        title={selectedScreening ? `${selectedScreening.movieTitle} | ${selectedScreening.hall} | ${selectedScreening.date} ${selectedScreening.time}` : 'Seat Map'}
        open={seatMapModalOpen}
        onCancel={() => setSeatMapModalOpen(false)}
        footer={<Button onClick={() => setSeatMapModalOpen(false)}>Close</Button>}
        width={1000}
      >
        {selectedScreening && (() => {
          const hall = halls.find((h) => h.name === selectedScreening.hall);
          if (!hall) return <div>Hall not found</div>;
          
          const { booked, bought } = getScreeningSeats(selectedScreening);
          return (
            <>
              <div>
                <Tag>{booked.length} Booked</Tag>
                <Tag>{bought.length} Bought</Tag>
                <Tag>{booked.length + bought.length} / {hall.capacity} occupied</Tag>
              </div>
              <SeatMap hall={hall} bookedSeats={booked} boughtSeats={bought} onSeatClick={openBookingModal} />
            </>
          );
        })()}
      </Modal>

      {/* Booking Modal */}
      <Modal
        title={editingBooking ? `Edit Booking - Seat ${selectedSeat}` : `Create Booking - Seat ${selectedSeat}`}
        open={bookingModalOpen}
        onOk={saveBooking}
        onCancel={() => { setBookingModalOpen(false); bookingForm.resetFields(); }}
        width={600}
        footer={[
          editingBooking && <Button key="delete" danger onClick={deleteBooking}>Delete</Button>,
          <Button key="cancel" onClick={() => { setBookingModalOpen(false); bookingForm.resetFields(); }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={saveBooking}>{editingBooking ? 'Update' : 'Create'}</Button>,
        ]}
      >
        <Form form={bookingForm} layout="vertical">
          <Form.Item name="customerName" label="Name" rules={[{ required: true, message: 'Enter name' }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="customerEmail" label="Email" rules={[{ required: true, message: 'Enter email' }, { type: 'email', message: 'Valid email' }]}>
            <Input placeholder="john@example.com" />
          </Form.Item>
          <Form.Item name="customerPhone" label="Phone" rules={[{ required: true, message: 'Enter phone' }]}>
            <Input placeholder="+1-555-0101" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select status' }]}>
            <Select>
              <Select.Option value="booked">Booked (Reserved)</Select.Option>
              <Select.Option value="bought">Bought (Paid)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="totalPrice" label="Price ($)" rules={[{ required: true, message: 'Enter price' }]}>
            <InputNumber min={0} step={0.5} />
          </Form.Item>
          {selectedScreening && (
            <div>
              <div><strong>Movie:</strong> {selectedScreening.movieTitle}</div>
              <div><strong>Hall:</strong> {selectedScreening.hall}</div>
              <div><strong>Showtime:</strong> {selectedScreening.date} {selectedScreening.time}</div>
              <div><strong>Seat:</strong> {selectedSeat}</div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Screenings;
