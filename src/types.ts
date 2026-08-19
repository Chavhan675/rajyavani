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
  
  // Verification & Multi-Source Audit fields
  sourceName?: string;
  sourceUrl?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verificationNotes?: string;
  duplicateEventId?: string;
  cycleId?: string;
  isArchived?: boolean;
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  keyTakeaways?: string[];
  faqList?: Array<{ question: string; answer: string }>;
  factCheckingScore?: number; // 0-100
  
    corrigendumUrl?: string;
    corrigendumNotes?: string;
    lastVerifiedAt?: number;
  };
}

export interface CollectionCycle {
  id: string;
  startedAt: number;
  completedAt?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  durationMs?: number;
  sourcesChecked: number;
  storiesFound: number;
  storiesVerified: number;
  storiesRejected: number;
  duplicatesMerged: number;
  articlesPublished: number;
  maharashtraCount: number;
  nationalCount: number;
  districtCoverage: Record<string, number>;
  cycleScheduledTime?: string;
  triggeredBy: 'AUTOMATIC_3HR_SCHEDULER' | 'ADMIN_MANUAL';
  errors?: string[];
  logNotes?: string[];
}

export interface NewsSourceConfig {
  id: string;
  name: string;
  nameMarathi: string;
  type: 'GOV_PORTAL' | 'DGIPR' | 'PIB' | 'RSS' | 'DISTRICT_COLLECTORATE' | 'POLICE_BUREAU' | 'NEWS_AGENCY';
  url: string;
  region: 'MAHARASHTRA' | 'NATIONAL' | 'DISTRICT';
  district?: string;
  category?: string;
  trustScore: number;
  enabled: boolean;
  lastCheckedAt?: number;
  status: 'ACTIVE' | 'ERROR' | 'IDLE';
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

export type JobOpportunityCategory = 
  | 'GOVT_JOB' 
  | 'PRIVATE_JOB' 
  | 'INTERNSHIP' 
  | 'SCHOLARSHIP' 
  | 'ENTRANCE_EXAM' 
  | 'SKILL_TRAINING'
  | 'WALK_IN'
  | 'CAMPUS_DRIVE';

export type JobOpportunityStatus = 
    originalLastDate?: string; // Stored if deadline was extended
    isExtended?: boolean;
    examDate?: string;
  };
  corrigendumUrl?: string;
  corrigendumNotes?: string;
  applicationPortalActive?: boolean; // Live portal accepting applications (true/false)
  lastVerifiedAt?: number;           // Re-checked timestamp (updated every 3-hour cycle)
  
  verificationChecklist?: {
    officialNotificationVerified: boolean;
    officialWebsiteVerified: boolean;
    applicationPortalActive: boolean;
    latestCorrigendumChecked: boolean;
    datesMathVerified: boolean;
  };
  
  requiredDocuments: string[];
  officialLink: string;
  notificationPdfUrl?: string;
  description: string;
  descriptionEn?: string;
  isFresherEligible: boolean;
  isOfficialVerified: boolean;
  sourceName: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface CareerChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}


