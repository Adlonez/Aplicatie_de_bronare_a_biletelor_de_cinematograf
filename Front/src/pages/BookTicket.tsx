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
  Divider
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
      icon: <WarningOutlined />,
      content: (
        <div>
          <Alert
            message="Payment Deadline"
            description={`You must complete payment at least 45 minutes before the movie starts (${selectedTime}). Unpaid bookings will be automatically cancelled.`}
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
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
      <div>
        <Title level={2}>Movie not found</Title>
        <Button type="primary" onClick={() => navigate('/films')}>
          Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/films/${id}`)}
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
      />

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3}>
              {movie.title}
            </Title>
            <Text type="secondary">
              Showtime: {selectedTime}
            </Text>

            {/* Screen */}
            <div>
              <Text strong>SCREEN</Text>
            </div>

            {/* Seat Grid */}
            <div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(row => (
                <div key={row}>
                  <div>
                    {String.fromCharCode(64 + row)}
                  </div>
                  {seats
                    .filter(seat => seat.row === row)
                    .map(seat => (
                      <Button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={seat.status === 'occupied'}
                        type={seat.status === 'selected' ? 'primary' : seat.status === 'occupied' ? 'default' : 'dashed'}
                      >
                        {seat.number}
                      </Button>
                    ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <Divider />
            <Space>
              <Space>
                <div />
                <Text>Available</Text>
              </Space>
              <Space>
                <div />
                <Text>Selected</Text>
              </Space>
              <Space>
                <div />
                <Text>Occupied</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <div>
              <div>
                <Title level={4}>
                  BOOKING SUMMARY
                </Title>
                <Text>
                  Cinema Ticket Receipt
                </Text>
              </div>
              
              <Space direction="vertical">
                <div>
                  <Text strong>
                    SELECTED SEATS:
                  </Text>
                  <div>
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => (
                        <div key={seat.id}>
                          Row {String.fromCharCode(64 + seat.row)}, Seat {seat.number}
                        </div>
                      ))
                    ) : (
                      <Text>
                        No seats selected
                      </Text>
                    )}
                  </div>
                </div>

                <div>
                  <Space direction="vertical">
                    <div>
                      <Text>
                        Tickets x {selectedSeats.length}:
                      </Text>
                      <Text>
                        {selectedSeats.length * TICKET_PRICE} Lei
                      </Text>
                    </div>
                    <div>
                      <Text strong>
                        TOTAL:
                      </Text>
                      <Text strong>
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
                  PROCEED TO PAYMENT
                </Button>

                <div>
                  <div>
                    ⚠ DEADLINE REMINDER
                  </div>
                  Payment must be completed 45 minutes before showtime
                </div>
              </Space>
            </div>
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
        />

        <Radio.Group 
          onChange={(e) => setPaymentMethod(e.target.value)} 
          value={paymentMethod}
        >
          <Space direction="vertical" size="large">
            <Card hoverable>
              <Radio value="Credit Card">
                <Space>
                  <CreditCardOutlined />
                  <div>
                    <Text strong>Credit/Debit Card</Text>
                    <br />
                    <Text type="secondary">
                      Visa, Mastercard, American Express
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>

            <Card hoverable>
              <Radio value="Cash">
                <Space>
                  <DollarOutlined />
                  <div>
                    <Text strong>Cash at Cinema</Text>
                    <br />
                    <Text type="secondary">
                      Pay at the box office before showtime
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>

            <Card hoverable>
              <Radio value="Digital Wallet">
                <Space>
                  <WalletOutlined />
                  <div>
                    <Text strong>Digital Wallet</Text>
                    <br />
                    <Text type="secondary">
                      Apple Pay, Google Pay, PayPal
                    </Text>
                  </div>
                </Space>
              </Radio>
            </Card>
          </Space>
        </Radio.Group>

        <Divider />

        <div>
          <Space direction="vertical">
            <div>
              <Text strong>Movie:</Text>
              <Text>{movie.title}</Text>
            </div>
            <div>
              <Text strong>Showtime:</Text>
              <Text>{selectedTime}</Text>
            </div>
            <div>
              <Text strong>Seats:</Text>
              <Text>{selectedSeats.length}</Text>
            </div>
            <Divider />
            <div>
              <Text strong>Total Amount:</Text>
              <Text strong>
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
