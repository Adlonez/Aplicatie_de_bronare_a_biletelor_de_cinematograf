export interface Films{
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

