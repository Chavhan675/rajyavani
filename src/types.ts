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

export type UserRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface UserRole {
  uid: string;
  email: string | null;
  role: UserRoleType;
  displayName: string | null;
  photoURL?: string | null;
  preferredDistrict?: string | null;
  preferredCategory?: string | null;
  isSuspended?: boolean;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: number;
  bookmarks?: string[];
  createdAt?: number;
}

export interface AuthAuditLog {
  id?: string;
  userId?: string;
  email: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'REGISTER_SUCCESS' | 'LOGOUT' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_CHANGED';
  method: 'PASSWORD' | 'GOOGLE';
  success: boolean;
  role?: string;
  userAgent?: string;
  timestamp: number;
}

