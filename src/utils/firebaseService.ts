import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
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
  const q = query(NEWS_COLLECTION, orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const list: NewsItem[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as NewsItem));
    onNews(list);
  });
}

// 4. Subscribe to photos
export function subscribeToPhotos(onPhotos: (photos: FamilyPhoto[]) => void) {
  return onSnapshot(PHOTOS_COLLECTION, (snapshot) => {
    const list: FamilyPhoto[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as FamilyPhoto));
    onPhotos(list);
  });
}

// 5. Subscribe to requests
export function subscribeToRequests(onRequests: (requests: RegistrationRequest[]) => void) {
  const q = query(REQUESTS_COLLECTION, orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: RegistrationRequest[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as RegistrationRequest));
    onRequests(list);
  });
}

// 6. Subscribe to messages
export function subscribeToMessages(onMessages: (messages: FamilyMessage[]) => void) {
  const q = query(MESSAGES_COLLECTION, orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: FamilyMessage[] = [];
    snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() } as FamilyMessage));
    onMessages(list);
  });
}

// 7. Subscribe to audit logs
export function subscribeToAuditLogs(onLogs: (logs: LiveChangeLog[]) => void) {
  const q = query(AUDIT_COLLECTION, orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const logs: LiveChangeLog[] = [];
    snapshot.forEach((docSnap) => logs.push({ id: docSnap.id, ...docSnap.data() } as LiveChangeLog));
    onLogs(logs);
  });
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
        batch.set(ref, member, { merge: true });
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
  const ref = doc(db, 'family_members', member.id);
  await setDoc(ref, member, { merge: true });
}

// Delete single member
export async function deleteMemberFromCloud(memberId: string) {
  const ref = doc(db, 'family_members', memberId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
}

// Save batch of members (e.g. after reordering or adding child)
export async function saveMultipleMembersToCloud(members: FamilyMember[]) {
  if (!members || members.length === 0) return;
  const chunks: FamilyMember[][] = [];
  for (let i = 0; i < members.length; i += 300) {
    chunks.push(members.slice(i, i + 300));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const member of chunk) {
      const ref = doc(db, 'family_members', member.id);
      batch.set(ref, member, { merge: true });
    }
    await batch.commit();
  }
}

// Save family info
export async function saveFamilyInfoToCloud(info: FamilyInfo) {
  await setDoc(SETTINGS_DOC, info, { merge: true });
}

// Save request
export async function saveRequestToCloud(req: RegistrationRequest) {
  const ref = doc(db, 'family_requests', req.id);
  await setDoc(ref, req, { merge: true });
}

// Save photo
export async function savePhotoToCloud(photo: FamilyPhoto) {
  const ref = doc(db, 'family_photos', photo.id);
  await setDoc(ref, photo, { merge: true });
}

// Delete photo
export async function deletePhotoFromCloud(photoId: string) {
  const ref = doc(db, 'family_photos', photoId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
}

// Save news
export async function saveNewsToCloud(item: NewsItem) {
  const ref = doc(db, 'family_news', item.id);
  await setDoc(ref, item, { merge: true });
}

// Delete news
export async function deleteNewsFromCloud(newsId: string) {
  const ref = doc(db, 'family_news', newsId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
}

// Save message
export async function saveMessageToCloud(msg: FamilyMessage) {
  const ref = doc(db, 'family_messages', msg.id);
  await setDoc(ref, msg, { merge: true });
}

// Delete message
export async function deleteMessageFromCloud(msgId: string) {
  const ref = doc(db, 'family_messages', msgId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
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
