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
  triggeredBy: 'AUTOMATIC_3HR_SCHEDULER' | 'ADMIN_MANUAL' | 'TURBO_FAST_TRACK' | 'MULTI_AI_BALANCER';
  errors?: string[];
  logNotes?: string[];
}

export type AiEngineId =
  | 'ENGINE_MAHARASHTRA_GOVERNANCE'
  | 'ENGINE_DISTRICTS_HYPERLOCAL'
  | 'ENGINE_AGRICULTURE_MANDI'
  | 'ENGINE_NATIONAL_PARLIAMENT'
  | 'ENGINE_CRIME_LAW_SENTINEL'
  | 'ENGINE_BUSINESS_MARKETS'
  | 'ENGINE_SPORTS_KRIDA'
  | 'ENGINE_EDUCATION_CAREERS'
  | 'ENGINE_TECH_SCIENCE_SPACE'
  | 'ENGINE_ENTERTAINMENT_CULTURE'
  | 'ENGINE_HEALTH_ENVIRONMENT'
  | 'ENGINE_BREAKING_FACTCHECK';

export interface AiEngineConfig {
  id: AiEngineId;
  name: string;
  nameMarathi: string;
  domain: string;
  domainMarathi: string;
  description: string;
  iconName: string;
  badgeColor: string;
  category: string;
  categorySlug: string;
  enabled: boolean;
  priorityWeight: number; // 1 to 10
  defaultTargetArticles: number;
  systemPromptRole: string;
  searchKeywords: string[];
  rssQuery: string;
  status: 'ACTIVE' | 'BUSY' | 'IDLE' | 'ERROR';
  totalArticlesPublished: number;
  lastRunAt: number | null;
  avgWordCount: number;
  healthScore: number; // 0-100
  lastArticleHeadline?: string;
}

export interface MultiEngineCycleResult {
  success: boolean;
  cycleId: string;
  timestamp: number;
  durationSeconds: number;
  totalArticles: number;
  engineStats: Record<string, { count: number; status: string; duration: number }>;
  newArticles: NewsArticle[];
  errors?: string[];
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

export type JobOpportunityStatus = 'OPEN' | 'CLOSING_SOON' | 'EXPIRED' | 'UPCOMING' | 'EXTENDED';

export interface JobOpportunity {
  id: string;
  title: string;
  organization: string;
  category: JobOpportunityCategory;
  status: JobOpportunityStatus;
  qualification: string[];
  totalVacancies?: number;
  location?: string;
  district?: string;
  salaryOrStipend?: string;
  applicationFee?: string;
  startDate?: string;
  lastDate: string;
  datesDetails?: {
    originalLastDate?: string;
    isExtended?: boolean;
    examDate?: string;
  };
  corrigendumUrl?: string;
  corrigendumNotes?: string;
  applicationPortalActive?: boolean;
  lastVerifiedAt?: number;
  
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
