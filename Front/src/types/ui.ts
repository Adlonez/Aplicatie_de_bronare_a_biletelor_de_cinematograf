export interface Films {
  id: number;
  title: string;
  poster: string;
  image: string; // this is for vertical
  description: string;
  href: string;
  format: "2D" | "3D";
  languages: string[];
  status: "progress" | "soon";
  toptier: boolean;
  // Admin panel fields
  duration?: number;
  genre?: string;
  releaseDate?: string;
  screeningPeriod?: {
    start: string;
    end: string;
  };
  deleted?: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  content: string;
  image: string;
  fullContent: string;
}

export interface Screening {
  id: number;
  movieId: number;
  movieTitle: string;
  hall: string;
  date: string;
  time: string;
  deleted?: boolean;
}

export interface Booking {
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
  deleted?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  deleted?: boolean;
}

export interface Hall {
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