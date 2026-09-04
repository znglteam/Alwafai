export interface MemberComment {
  id: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string; // First name
  fatherName: string; // Father's name
  grandfatherName: string; // Grandfather's name
  birthYear: number;
  birthDate?: string;
  deathDate?: string;
  country: string;
  specialization: string;
  isAlive: boolean;
  deathYear?: number | null;
  bio: string;
  avatar?: string;
  avatarScale?: number;
  avatarX?: number;
  avatarY?: number;
  spouseName?: string | null;
  spouseId?: string | null;
  childrenNamesText?: string | null;
  maritalStatus?: 'أعزب' | 'مرتبط' | 'متزوج' | 'منفصل/ أرمل' | '( اختر )' | '';
  fatherId?: string | null;
  motherId?: string | null;
  childrenIds: string[];
  registeredUserId?: string | null;
  gender?: 'male' | 'female';
  orderIndex?: number;
  comments?: MemberComment[];
}

export interface RegistrationRequest {
  id: string;
  name: string;
  fatherName: string;
  grandfatherName: string;
  email: string;
  password?: string; // Kept secure in client simulation
  birthYear: number;
  birthDate?: string;
  deathDate?: string;
  country: string;
  specialization: string;
  isAlive: boolean;
  bio: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  gender?: 'male' | 'female';
  childrenNamesText?: string | null;
  maritalStatus?: 'أعزب' | 'مرتبط' | 'متزوج' | 'منفصل/ أرمل' | '( اختر )' | '';
}

export interface NewsItem {
  id: string;
  type: 'welcome' | 'baby' | 'condolence' | 'general';
  content: string;
  createdAt: string;
}

export interface FamilyPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
  description?: string;
  comments?: MemberComment[];
}

export interface FamilyInfo {
  familyName: string;
  bio: string;
  history: string;
}

export type UserRole = 'guest' | 'pending' | 'member' | 'admin';

export interface FamilyMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'none';
  createdAt: string;
}

export interface UserSession {
  userId: string | null; // FamilyMember ID or Request ID if pending
  name: string;
  email: string;
  role: UserRole;
  requestId?: string; // If pending
}
