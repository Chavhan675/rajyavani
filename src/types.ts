export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Location {
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: Category;
  location: Location;
  publishedAt: string;
  author: string;
  authorAvatar?: string;
  lastUpdated?: string;
  tags?: string[];
  isBreaking?: boolean;
  isTrending?: boolean;
  aiGenerated: boolean;
  views: number;
}
