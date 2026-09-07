import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FamilyMember, RegistrationRequest, NewsItem, FamilyPhoto, FamilyInfo, FamilyMessage } from '../types';

const firebaseConfig = {
  projectId: "gen-lang-client-0131349304",
  appId: "1:803024720627:web:9c91b5dc77bc2eacaa1d86",
  apiKey: "AIzaSyA3f9euLz3BavCgYJs-l06BWf0ke7pdRb0",
  authDomain: "gen-lang-client-0131349304.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-69be9d34-a864-43d5-8d57-2894aa046237",
  storageBucket: "gen-lang-client-0131349304.firebasestorage.app",
  messagingSenderId: "803024720627"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export interface LiveChangeLog {
  id: string;
  userName: string;
  userPhone?: string;
  action: string;
  details: string;
  timestamp: string;
  targetMemberName?: string;
}

// Separate document collections - Each document is tiny (< 2KB), perfectly scalable to millions of members
const MEMBERS_COLLECTION = collection(db, 'family_members');
const SETTINGS_DOC = doc(db, 'family_app_meta', 'general_info');
const NEWS_COLLECTION = collection(db, 'family_news');
const PHOTOS_COLLECTION = collection(db, 'family_photos');
const REQUESTS_COLLECTION = collection(db, 'family_requests');
const MESSAGES_COLLECTION = collection(db, 'family_messages');
const AUDIT_COLLECTION = collection(db, 'family_audit_logs');

// 1. Subscribe to real-time members collection
export function subscribeToMembers(
  onMembers: (members: FamilyMember[]) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(
    MEMBERS_COLLECTION,
    (snapshot) => {
      const list: FamilyMember[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FamilyMember);
      });
      onMembers(list);
    },
    (err) => {
      console.error('Members real-time error:', err);
      if (onError) onError(err);
    }
  );
}

// 2. Subscribe to general family info
export function subscribeToFamilyInfo(onInfo: (info: FamilyInfo) => void) {
  return onSnapshot(SETTINGS_DOC, (docSnap) => {
    if (docSnap.exists()) {
      onInfo(docSnap.data() as FamilyInfo);
    }
  });
}

// 3. Subscribe to news
export function subscribeToNews(onNews: (news: NewsItem[]) => void) {
  return onSnapshot(NEWS_COLLECTION, (snapshot) => {
    const list: NewsItem[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as NewsItem));
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onNews(list);
  }, (err) => {
    console.error('News listener error:', err);
  });
}

// 4. Subscribe to photos
export function subscribeToPhotos(onPhotos: (photos: FamilyPhoto[]) => void) {
  return onSnapshot(PHOTOS_COLLECTION, (snapshot) => {
    const list: FamilyPhoto[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as FamilyPhoto));
    onPhotos(list);
  }, (err) => {
    console.error('Photos listener error:', err);
  });
}

// 5. Subscribe to requests
export function subscribeToRequests(onRequests: (requests: RegistrationRequest[]) => void) {
  return onSnapshot(REQUESTS_COLLECTION, (snapshot) => {
    const list: RegistrationRequest[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, ...data } as RegistrationRequest);
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onRequests(list);
  }, (err) => {
    console.error('Requests listener error:', err);
  });
}

// 6. Subscribe to messages
export function subscribeToMessages(onMessages: (messages: FamilyMessage[]) => void) {
  return onSnapshot(MESSAGES_COLLECTION, (snapshot) => {
    const list: FamilyMessage[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as FamilyMessage));
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onMessages(list);
  }, (err) => {
    console.error('Messages listener error:', err);
  });
}

// 7. Subscribe to audit logs
export function subscribeToAuditLogs(onLogs: (logs: LiveChangeLog[]) => void) {
  return onSnapshot(AUDIT_COLLECTION, (snapshot) => {
    const logs: LiveChangeLog[] = [];
    snapshot.forEach((docSnap) => logs.push({ id: docSnap.id, ...docSnap.data() } as LiveChangeLog));
    logs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    onLogs(logs);
  }, (err) => {
    console.error('Audit logs listener error:', err);
  });
}

// Helper to recursively strip undefined values which crash Firestore setDoc
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return obj;
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanForFirestore(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(v => (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) ? cleanForFirestore(v) : v).filter(v => v !== undefined);
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
}

// ----------------- WRITE OPERATIONS -----------------

// Batch seed or push all members to Cloud Firestore
export async function seedInitialMembersIfEmpty(members: FamilyMember[]) {
  if (!members || members.length === 0) return;
  try {
    const chunks: FamilyMember[][] = [];
    for (let i = 0; i < members.length; i += 300) {
      chunks.push(members.slice(i, i + 300));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const member of chunk) {
        const ref = doc(db, 'family_members', member.id);
        batch.set(ref, cleanForFirestore(member), { merge: true });
      }
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding members in batch:', error);
  }
}

// Upload full local tree to cloud
export async function syncAllLocalToCloud(
  members: FamilyMember[],
  familyInfo: FamilyInfo,
  news: NewsItem[],
  photos: FamilyPhoto[],
  messages: FamilyMessage[]
) {
  try {
    if (members && members.length > 0) {
      await seedInitialMembersIfEmpty(members);
    }
    if (familyInfo) {
      await saveFamilyInfoToCloud(familyInfo);
    }
    if (news && news.length > 0) {
      for (const item of news) {
        await saveNewsToCloud(item);
      }
    }
    if (photos && photos.length > 0) {
      for (const p of photos) {
        await savePhotoToCloud(p);
      }
    }
    if (messages && messages.length > 0) {
      for (const m of messages) {
        await saveMessageToCloud(m);
      }
    }
    return true;
  } catch (err) {
    console.error('syncAllLocalToCloud error:', err);
    throw err;
  }
}

// Save single member
export async function saveMemberToCloud(member: FamilyMember) {
  try {
    const ref = doc(db, 'family_members', member.id);
    await setDoc(ref, cleanForFirestore(member), { merge: true });
  } catch (err) {
    console.error('Error saving member to Firestore:', err);
  }
}

// Delete single member
export async function deleteMemberFromCloud(memberId: string) {
  try {
    const ref = doc(db, 'family_members', memberId);
    const batch = writeBatch(db);
    batch.delete(ref);
    await batch.commit();
  } catch (err) {
    console.error('Error deleting member from Firestore:', err);
  }
}

// Save batch of members (e.g. after reordering or adding child)
export async function saveMultipleMembersToCloud(members: FamilyMember[]) {
  if (!members || members.length === 0) return;
  try {
    const chunks: FamilyMember[][] = [];
    for (let i = 0; i < members.length; i += 300) {
      chunks.push(members.slice(i, i + 300));
    }
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const member of chunk) {
        const ref = doc(db, 'family_members', member.id);
        batch.set(ref, cleanForFirestore(member), { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.error('Error saving multiple members to Firestore:', err);
  }
}

// Save family info
export async function saveFamilyInfoToCloud(info: FamilyInfo) {
  try {
    await setDoc(SETTINGS_DOC, cleanForFirestore(info), { merge: true });
  } catch (err) {
    console.error('Error saving family info to Firestore:', err);
  }
}

// Save request
export async function saveRequestToCloud(req: RegistrationRequest) {
  try {
    const ref = doc(db, 'family_requests', req.id);
    await setDoc(ref, cleanForFirestore(req), { merge: true });
    console.log('Successfully saved registration request to Firestore:', req.id);
  } catch (err) {
    console.error('Error saving request to Firestore:', err);
    throw err;
  }
}

// Delete request
export async function deleteRequestFromCloud(requestId: string) {
  try {
    const ref = doc(db, 'family_requests', requestId);
    await deleteDoc(ref);
    console.log('Successfully deleted registration request from Firestore:', requestId);
  } catch (err) {
    console.error('Error deleting request from Firestore:', err);
  }
}

// Save photo
export async function savePhotoToCloud(photo: FamilyPhoto) {
  try {
    const ref = doc(db, 'family_photos', photo.id);
    await setDoc(ref, cleanForFirestore(photo), { merge: true });
  } catch (err) {
    console.error('Error saving photo to Firestore:', err);
  }
}

// Delete photo
export async function deletePhotoFromCloud(photoId: string) {
  try {
    const ref = doc(db, 'family_photos', photoId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Error deleting photo from Firestore:', err);
  }
}

// Save news
export async function saveNewsToCloud(item: NewsItem) {
  try {
    const ref = doc(db, 'family_news', item.id);
    await setDoc(ref, cleanForFirestore(item), { merge: true });
  } catch (err) {
    console.error('Error saving news to Firestore:', err);
    throw err;
  }
}

// Delete news
export async function deleteNewsFromCloud(newsId: string) {
  try {
    const ref = doc(db, 'family_news', newsId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Error deleting news from Firestore:', err);
    throw err;
  }
}

// Save message
export async function saveMessageToCloud(msg: FamilyMessage) {
  try {
    const ref = doc(db, 'family_messages', msg.id);
    await setDoc(ref, cleanForFirestore(msg), { merge: true });
  } catch (err) {
    console.error('Error saving message to Firestore:', err); throw err;
  }
}

// Delete message
export async function deleteMessageFromCloud(msgId: string) {
  try {
    const ref = doc(db, 'family_messages', msgId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Error deleting message from Firestore:', err);
  }
}

// Log an action to real-time audit trail
export async function logFamilyAction(
  userName: string,
  action: string,
  details: string,
  targetMemberName?: string,
  userPhone?: string
) {
  try {
    await addDoc(AUDIT_COLLECTION, {
      userName,
      action,
      details,
      targetMemberName: targetMemberName || '',
      userPhone: userPhone || '',
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export async function deleteAuditLogFromCloud(logId: string) {
  try {
    await deleteDoc(doc(db, 'family_audit_logs', logId));
  } catch (err) {
    console.error('Error deleting log:', err);
    throw err;
  }
}

export async function clearAllAuditLogsFromCloud(logs: LiveChangeLog[]) {
  try {
    // Firestore batch limit is 500 operations
    const chunkSize = 500;
    for (let i = 0; i < logs.length; i += chunkSize) {
      const chunk = logs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(log => {
        const ref = doc(db, 'family_audit_logs', log.id);
        batch.delete(ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Error clearing logs:', err);
    throw err;
  }
}
