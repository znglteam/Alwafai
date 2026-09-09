export interface MemberComment {
  isReadByMember?: boolean;
  isReadByAdmin?: boolean;
  id: string;
  senderName: string;
  senderEmail: string;
  senderId?: string;
  content: string;
  createdAt: string;
}

export interface SpouseInfo {
  id?: string | null; // Member ID if spouse is from the same family tree
  name: string; // Spouse full/display name
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
  spouses?: SpouseInfo[];
  childrenNamesText?: string | null;
  maritalStatus?: 'أعزب' | 'مرتبط' | 'متزوج' | 'منفصل/ أرمل' | '( اختر )' | '';
  fatherId?: string | null;
  motherId?: string | null;
  childrenIds: string[];
  registeredUserId?: string | null;
  email?: string | null;
  gender?: 'male' | 'female';
  orderIndex?: number;
  comments?: MemberComment[];
}

export const getMemberSpouses = (m?: Partial<FamilyMember> | null): SpouseInfo[] => {
  if (!m) return [];
  if (m.spouses && Array.isArray(m.spouses) && m.spouses.length > 0) {
    return m.spouses.filter(s => (s.name && s.name.trim()) || s.id);
  }
  if (m.spouseName || m.spouseId) {
    return [{ id: m.spouseId || null, name: m.spouseName || '' }];
  }
  return [];
};

export interface RegistrationRequest {
  isReadByMember?: boolean;
  isReadByAdmin?: boolean;
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
  siblings?: string[];
  unclesAndAunts?: string[];
}

export interface NewsItem {
  isReadByMember?: boolean;
  isReadByAdmin?: boolean;
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

export interface MessageReply {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface FamilyMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderId?: string;
  recipientEmail?: string;
  targetMemberId?: string;
  messageType?: 'contact' | 'profile_comment_member' | 'profile_comment_admin' | 'admin_direct';
  subject: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'none';
  createdAt: string;
  replies?: MessageReply[];
  isReadByAdmin?: boolean;
  isReadByMember?: boolean;
}

export interface UserSession {
  userId: string | null; // FamilyMember ID or Request ID if pending
  name: string;
  email: string;
  role: UserRole;
  requestId?: string; // If pending
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  repliesCount: number;
}

export interface ForumReply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface UserPresence {
  id: string;
  name: string;
  role: string;
  lastActive: string;
}
