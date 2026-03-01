import { useState, type FC } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Tag, message, theme } from 'antd';
import SeatMap from './SeatMap';
import type { Screening, Booking, Hall } from '../../types/ui';

interface Props {
  screening: Screening | null;
  halls: Hall[];
  bookings: Booking[];
  onBookingsChange: (bookings: Booking[]) => void;
  open: boolean;
  onClose: () => void;
}

const SeatMapModal: FC<Props> = ({ screening, halls, bookings, onBookingsChange, open, onClose }) => {
  const { token } = theme.useToken();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm] = Form.useForm();

  if (!screening) return null;

  const hall = halls.find((h) => h.name === screening.hall);
  const screeningDateTime = `${screening.date} ${screening.time}`;

  const relevantBookings = bookings.filter(
    (b) => !b.deleted && b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === screeningDateTime,
  );
  const bookedSeats = relevantBookings.filter((b) => b.status === 'booked').flatMap((b) => b.seats);
  const boughtSeats = relevantBookings.filter((b) => b.status === 'bought').flatMap((b) => b.seats);

  const openBookingModal = (seat: string) => {
    setSelectedSeat(seat);
    const existing = bookings.find(
      (b) => b.movieTitle === screening.movieTitle && b.hall === screening.hall && b.showtime === screeningDateTime && b.seats.includes(seat),
    );

    if (existing) {
      setEditingBooking(existing);
      bookingForm.setFieldsValue({
        customerName: existing.customerName,
        customerEmail: existing.customerEmail,
        customerPhone: existing.customerPhone,
        status: existing.status,
        totalPrice: existing.totalPrice,
      });
    } else {
      setEditingBooking(null);
      bookingForm.setFieldsValue({ status: 'booked', totalPrice: 14.0 });
    }
    setBookingModalOpen(true);
  };

  const saveBooking = () => {
    if (!selectedSeat) return;

    bookingForm.validateFields().then((values) => {
      if (editingBooking) {
        onBookingsChange(bookings.map((b) => (b.id === editingBooking.id ? { ...editingBooking, ...values } : b)));
        message.success('Booking updated');
      } else {
        const newBooking: Booking = {
          id: Date.now(),
          movieId: screening.movieId,
          movieTitle: screening.movieTitle,
          ...values,
          hall: screening.hall,
          seats: [selectedSeat],
          bookingDate: new Date().toISOString().split('T')[0],
          showtime: screeningDateTime,
        };
        onBookingsChange([...bookings, newBooking]);
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
        onBookingsChange(bookings.filter((b) => b.id !== editingBooking.id));
        message.success('Booking deleted');
        setBookingModalOpen(false);
        bookingForm.resetFields();
      },
    });
  };

  return (
    <>
      <Modal
        title={`${screening.movieTitle} | ${screening.hall} | ${screening.date} ${screening.time}`}
        open={open}
        onCancel={onClose}
        footer={<Button onClick={onClose}>Close</Button>}
        width={1000}
      >
        {hall ? (
          <>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Tag color="orange">{bookedSeats.length} Booked</Tag>
              <Tag color="red">{boughtSeats.length} Bought</Tag>
              <Tag color="blue">{bookedSeats.length + boughtSeats.length} / {hall.capacity} occupied</Tag>
            </div>
            <SeatMap hall={hall} bookedSeats={bookedSeats} boughtSeats={boughtSeats} onSeatClick={openBookingModal} />
          </>
        ) : (
          <div>Hall not found</div>
        )}
      </Modal>

      <Modal
        title={editingBooking ? `Edit Booking - Seat ${selectedSeat}` : `Create Booking - Seat ${selectedSeat}`}
        open={bookingModalOpen}
        onCancel={() => { setBookingModalOpen(false); bookingForm.resetFields(); }}
        footer={[
          editingBooking && <Button key="delete" danger onClick={deleteBooking}>Delete</Button>,
          <Button key="cancel" onClick={() => { setBookingModalOpen(false); bookingForm.resetFields(); }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={saveBooking}>{editingBooking ? 'Update' : 'Create'}</Button>,
        ]}
        width={600}
      >
        <Form form={bookingForm} layout="vertical">
          <Form.Item name="customerName" label="Name" rules={[{ required: true, message: 'Enter name' }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="customerEmail" label="Email" rules={[{ required: true, message: 'Enter email' }, { type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="john@example.com" />
          </Form.Item>
          <Form.Item name="customerPhone" label="Phone" rules={[{ required: true, message: 'Enter phone' }]}>
            <Input placeholder="+1-555-0101" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select status' }]}>
            <Select options={[{ value: 'booked', label: 'Booked (Reserved)' }, { value: 'bought', label: 'Bought (Paid)' }]} />
          </Form.Item>
          <Form.Item name="totalPrice" label="Price ($)" rules={[{ required: true, message: 'Enter price' }]}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ padding: 12, backgroundColor: token.colorFillQuaternary, borderRadius: 4 }}>
            <div style={{ color: token.colorText }}><strong>Movie:</strong> {screening.movieTitle}</div>
            <div style={{ color: token.colorText }}><strong>Hall:</strong> {screening.hall}</div>
            <div style={{ color: token.colorText }}><strong>Showtime:</strong> {screening.date} {screening.time}</div>
            <div style={{ color: token.colorText }}><strong>Seat:</strong> {selectedSeat}</div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SeatMapModal;
