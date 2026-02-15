import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Space, 
  message, 
  Modal,
  Radio,
  Alert,
  Divider,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import filmsData from '../_mock/films.json';

const { Title, Text } = Typography;

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'occupied' | 'selected';
}

const BookTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTime = location.state?.time || '19:00';
  
  const movie = filmsData.find(film => film.id === Number(id));
  
  // Initialize seats - 8 rows, 12 seats each
  const initializeSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const occupiedSeats = ['3-5', '3-6', '4-7', '5-5', '5-6', '5-7', '6-8']; // Some pre-booked seats
    
    for (let row = 1; row <= 8; row++) {
      for (let number = 1; number <= 12; number++) {
        const seatId = `${row}-${number}`;
        seats.push({
          id: seatId,
          row,
          number,
          status: occupiedSeats.includes(seatId) ? 'occupied' : 'available'
        });
      }
    }
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>(initializeSeats());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const TICKET_PRICE = 50; // Lei per ticket

  const selectedSeats = seats.filter(seat => seat.status === 'selected');
  const totalPrice = selectedSeats.length * TICKET_PRICE;

  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === seatId && seat.status !== 'occupied') {
          return {
            ...seat,
            status: seat.status === 'selected' ? 'available' : 'selected'
          };
        }
        return seat;
      })
    );
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'selected':
        return '#7c3aed'; // Purple
      case 'occupied':
        return '#666';
      case 'available':
      default:
        return '#1890ff';
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      message.warning('Please select at least one seat');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = () => {
    if (!paymentMethod) {
      message.warning('Please select a payment method');
      return;
    }

    Modal.confirm({
      title: 'Confirm Booking',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <Alert
            message="Payment Deadline"
            description={`You must complete payment at least 45 minutes before the movie starts (${selectedTime}). Unpaid bookings will be automatically cancelled.`}
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
          <p><strong>Movie:</strong> {movie?.title}</p>
          <p><strong>Showtime:</strong> {selectedTime}</p>
          <p><strong>Seats:</strong> {selectedSeats.map(s => `${String.fromCharCode(64 + s.row)}${s.number}`).join(', ')}</p>
          <p><strong>Total:</strong> {totalPrice} Lei</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
        </div>
      ),
      okText: 'Confirm & Pay',
      cancelText: 'Cancel',
      onOk() {
        message.success('Booking confirmed! Redirecting to payment...');
        setTimeout(() => {
          navigate('/films');
        }, 2000);
      },
    });
  };

  if (!movie) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#fff' }}>Movie not found</Title>
        <Button type="primary" onClick={() => navigate('/films')}>
          Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/films/${id}`)}
        style={{ marginBottom: '20px' }}
      >
        Back to Movie Details
      </Button>

      <Alert
        message="Important: Payment Deadline"
        description={`Complete your payment at least 45 minutes before showtime (${selectedTime}) to secure your booking.`}
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        closable
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
              {movie.title}
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
              Showtime: {selectedTime}
            </Text>

            {/* Screen */}
            <div style={{ 
              background: 'linear-gradient(180deg, #333 0%, #666 100%)',
              padding: '12px',
              textAlign: 'center',
              marginBottom: '40px',
              borderRadius: '0 0 50% 50%',
              border: '2px solid #999'
            }}>
              <Text strong style={{ color: '#fff', fontSize: '16px' }}>SCREEN</Text>
            </div>

            {/* Seat Grid */}
            <div style={{ overflowX: 'auto' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(row => (
                <div key={row} style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '10px'
                  }}>
                    {String.fromCharCode(64 + row)}
                  </div>
                  {seats
                    .filter(seat => seat.row === row)
                    .map(seat => (
                      <Button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={seat.status === 'occupied'}
                        style={{
                          width: '40px',
                          height: '40px',
                          margin: '0 4px',
                          padding: '0',
                          backgroundColor: getSeatColor(seat.status),
                          borderColor: getSeatColor(seat.status),
                          color: '#fff',
                          cursor: seat.status === 'occupied' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {seat.number}
                      </Button>
                    ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <Divider />
            <Space style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Space>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#1890ff',
                  borderRadius: '4px'
                }} />
                <Text>Available</Text>
              </Space>
              <Space>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#7c3aed',
                  borderRadius: '4px'
                }} />
                <Text>Selected</Text>
              </Space>
              <Space>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: '#666',
                  borderRadius: '4px'
                }} />
                <Text>Occupied</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>Booking Summary</Title>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Selected Seats:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map(seat => (
                      <Tag key={seat.id} color="purple" style={{ marginBottom: 8 }}>
                        Row {String.fromCharCode(64 + seat.row)}, Seat {seat.number}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">No seats selected</Text>
                  )}
                </div>
              </div>

              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tickets ({selectedSeats.length}x):</Text>
                    <Text>{selectedSeats.length * TICKET_PRICE} Lei</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: '18px' }}>Total:</Text>
                    <Text strong style={{ fontSize: '18px', color: '#7c3aed' }}>
                      {totalPrice} Lei
                    </Text>
                  </div>
                </Space>
              </div>

              <Button 
                type="primary" 
                size="large" 
                block
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0}
                icon={<CheckCircleOutlined />}
              >
                Proceed to Payment
              </Button>

              <Alert
                message="Deadline Reminder"
                description="Payment must be completed 45 minutes before showtime"
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title="Select Payment Method"
        open={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
        onOk={handleConfirmBooking}
        okText="Confirm Booking"
        width={500}
      >
        <Alert
          message="Payment must be completed within 45 minutes before showtime"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Radio.Group 
          onChange={(e) => setPaymentMethod(e.target.value)} 
          value={paymentMethod}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card hoverable style={{ cursor: 'pointer' }}>
              <Radio value="Credit Card">
                <Space>
                  <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Text strong>Credit/Debit Card</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Visa, Mastercard, American Express
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>

            <Card hoverable style={{ cursor: 'pointer' }}>
              <Radio value="Cash">
                <Space>
                  <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div>
                    <Text strong>Cash at Cinema</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Pay at the box office before showtime
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>

            <Card hoverable style={{ cursor: 'pointer' }}>
              <Radio value="Digital Wallet">
                <Space>
                  <WalletOutlined style={{ fontSize: '24px', color: '#7c3aed' }} />
                  <div>
                    <Text strong>Digital Wallet</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Apple Pay, Google Pay, PayPal
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>

        <Divider />

        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Movie:</Text>
              <Text>{movie.title}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Showtime:</Text>
              <Text>{selectedTime}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Seats:</Text>
              <Text>{selectedSeats.length}</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: '16px' }}>Total Amount:</Text>
              <Text strong style={{ fontSize: '16px', color: '#7c3aed' }}>
                {totalPrice} Lei
              </Text>
            </div>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default BookTicket;
