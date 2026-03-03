export enum Gender {
  male = "男子",
  female = "女子",
  unknown = "未設定"
}

export enum Mark {
  none = "",
  hit = "○",
  miss = "×"
}

export type Theme = 'light' | 'dark';

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  grade: number;
  color?: string;
  avatarUrl?: string;
}

export interface Alumni {
  id: string;
  name: string;
  gender: Gender;
  graduationYear: string;
  color?: string;
  avatarUrl?: string;
}

export interface Archer {
  id: string;
  name: string;
  gender: Gender;
  grade: number;
  isGuest: boolean;
  isSeparator?: boolean;
  isTotalCalculator?: boolean;
  marks: Mark[];
  color?: string;
  avatarUrl?: string;
}

export interface RecordEntry {
  name: string;
  gender: Gender;
  grade: number;
  totalShots: number;
  hits: number;
  isGuest: boolean;
}

export interface PracticeRecord {
  id: string;
  date: string;
  entries: RecordEntry[];
}

export interface SessionRecord {
  id: string;
  date: string;
  archers: Archer[];
  shotCount: number;
  note?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  isArchived?: boolean;
  tags?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SavedData {
  currentArchers: Archer[];
  members: Member[];
  alumni: Alumni[];
  history: PracticeRecord[];
  sessions: SessionRecord[];
  trash?: SessionRecord[];
  lastFiscalYearChecked: number;
  shotsPerRound: number;
  isFirstLaunch?: boolean;
  lockedBlocks?: Record<string, boolean>;
  accounts?: UserAccount[];
  theme?: Theme;
  hasSeenTutorial?: boolean;
  announcements?: Announcement[];
  auditLogs?: AuditLog[];
  lastUpdated?: number; // Last modification timestamp (ms)
}

export enum UserRole {
  admin = "admin",
  member = "member"
}

export interface UserAccount {
  id: string; // login ID
  passwordHash: string; // in a real app this should be hashed
  role: UserRole;
  name?: string;
  memberId?: string; // If role is member, links to members array
}
