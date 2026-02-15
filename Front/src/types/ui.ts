export interface Films {
  id: number;
  title: string;
  poster: string;
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
