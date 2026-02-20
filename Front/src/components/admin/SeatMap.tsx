import type { FC } from 'react';
import { theme } from 'antd';
import type { Hall } from '../../types/ui';

interface SeatMapProps {
  hall: Hall;
  bookedSeats?: string[];
  boughtSeats?: string[];
  onSeatClick?: (seat: string) => void;
}

const SeatMap: FC<SeatMapProps> = ({ hall, bookedSeats = [], boughtSeats = [], onSeatClick }) => {
  const { token } = theme.useToken();

  const getSeatId = (row: string, seat: number) => `${row}${seat}`;
  const isBooked = (row: string, seat: number) => bookedSeats.includes(getSeatId(row, seat));
  const isBought = (row: string, seat: number) => boughtSeats.includes(getSeatId(row, seat));
  const isOccupied = (row: string, seat: number) => isBooked(row, seat) || isBought(row, seat);

  const getSeatColor = (row: string, seat: number) => {
    if (isBought(row, seat)) return token.colorError;
    if (isBooked(row, seat)) return token.colorWarning;
    return token.colorFillSecondary;
  };

  const legendItems = [
    { color: token.colorFillSecondary, label: 'Available' },
    { color: token.colorWarning, label: 'Booked' },
    { color: token.colorError, label: 'Bought' },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: token.colorFillQuaternary, borderRadius: 8, maxWidth: 900, margin: '0 auto' }}>
      {/* Screen */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ backgroundColor: token.colorPrimary, height: 8, borderRadius: '50%', marginBottom: 8, boxShadow: `0 4px 8px ${token.colorPrimary}4D` }} />
        <div style={{ color: token.colorTextDescription, fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>SCREEN</div>
      </div>

      {/* Seats */}
      <div style={{ overflowX: 'auto' }}>
        {hall.seatMap.rows.map((rowData) => (
          <div key={rowData.row} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8, gap: 4 }}>
            <div style={{ width: 30, textAlign: 'center', fontWeight: 'bold', color: token.colorTextDescription, fontSize: 14 }}>
              {rowData.row}
            </div>
            {rowData.seats.map((seatNumber) => (
              <div
                key={seatNumber}
                onClick={() => onSeatClick?.(getSeatId(rowData.row, seatNumber))}
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: getSeatColor(rowData.row, seatNumber),
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: onSeatClick ? 'pointer' : 'default',
                  fontSize: 10,
                  fontWeight: 500,
                  color: isOccupied(rowData.row, seatNumber) ? '#fff' : token.colorTextDescription,
                  transition: 'all 0.2s',
                  border: '1px solid rgba(0,0,0,0.1)',
                  userSelect: 'none',
                }}
                title={getSeatId(rowData.row, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
        {legendItems.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: 14 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
