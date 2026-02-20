import React from 'react';
import { theme } from 'antd';

interface SeatMapProps {
  hall: {
    name: string;
    seatMap: {
      rows: Array<{
        row: string;
        seats: number[];
      }>;
    };
  };
  bookedSeats?: string[]; // Orange - Reserved but not paid
  boughtSeats?: string[]; // Red - Paid
  selectedSeats?: string[];
  onSeatClick?: (seat: string) => void;
  viewOnly?: boolean;
}

const SeatMap: React.FC<SeatMapProps> = ({ 
  hall, 
  bookedSeats = [],
  boughtSeats = [],
  selectedSeats = [],
  onSeatClick,
  viewOnly = false 
}) => {
  const { token } = theme.useToken();

  const isSeatBooked = (row: string, seat: number) => {
    return bookedSeats.includes(`${row}${seat}`);
  };

  const isSeatBought = (row: string, seat: number) => {
    return boughtSeats.includes(`${row}${seat}`);
  };

  const isSeatSelected = (row: string, seat: number) => {
    return selectedSeats.includes(`${row}${seat}`);
  };

  const handleSeatClick = (row: string, seat: number) => {
    const seatId = `${row}${seat}`;
    // Allow clicking on any seat in admin mode
    if (onSeatClick) {
      onSeatClick(seatId);
    }
  };

  const getSeatColor = (row: string, seat: number) => {
    if (isSeatBought(row, seat)) return token.colorError; // Red - Bought (paid)
    if (isSeatBooked(row, seat)) return token.colorWarning; // Orange - Booked (reserved)
    if (isSeatSelected(row, seat)) return token.colorSuccess; // Green - Selected
    return token.colorFillSecondary; // Gray - Available
  };

  const getSeatCursor = () => {
    // All seats are clickable in admin mode
    if (onSeatClick) return 'pointer';
    return 'default';
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: token.colorFillQuaternary, 
      borderRadius: '8px',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Screen */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: token.colorPrimary,
          height: '8px',
          borderRadius: '50%',
          marginBottom: '8px',
          boxShadow: `0 4px 8px ${token.colorPrimary}4D`
        }} />
        <div style={{ 
          color: token.colorTextDescription, 
          fontSize: '18px', 
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          SCREEN
        </div>
      </div>


      {/* Seats */}
      <div style={{ overflowX: 'auto' }}>
        {hall.seatMap.rows.map((rowData) => (
          <div
            key={rowData.row}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '4px'
            }}
          >
            {/* Row Label */}
            <div
              style={{
                width: '30px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#666',
                fontSize: '14px'
              }}
            >
              {rowData.row}
            </div>

            {/* Seats */}
            {rowData.seats.map((seatNumber) => (
              <div
                key={seatNumber}
                onClick={() => handleSeatClick(rowData.row, seatNumber)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: getSeatColor(rowData.row, seatNumber),
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: getSeatCursor(),
                  fontSize: '10px',
                  fontWeight: '500',
                  color: isSeatBought(rowData.row, seatNumber) || isSeatBooked(rowData.row, seatNumber) || isSeatSelected(rowData.row, seatNumber) ? '#fff' : '#666',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(0,0,0,0.1)',
                  userSelect: 'none'
                }}
                title={`${rowData.row}${seatNumber}`}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '24px', 
        marginTop: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            backgroundColor: '#d9d9d9',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)'
          }} />
          <span style={{ fontSize: '14px' }}>Available</span>
        </div>
        {!viewOnly && onSeatClick && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: '#52c41a',
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.1)'
            }} />
            <span style={{ fontSize: '14px' }}>Selected</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            backgroundColor: '#ff9800',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)'
          }} />
          <span style={{ fontSize: '14px' }}>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            backgroundColor: '#ff4d4f',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)'
          }} />
          <span style={{ fontSize: '14px' }}>Bought</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
