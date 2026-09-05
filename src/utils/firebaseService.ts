import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FamilyMember, RegistrationRequest, NewsItem, FamilyPhoto, FamilyInfo, FamilyMessage } from '../types';

// Hardcoded or imported Firebase configuration
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

export interface CloudFamilyState {
  members: FamilyMember[];
  familyInfo: FamilyInfo;
  news: NewsItem[];
  photos: FamilyPhoto[];
  requests: RegistrationRequest[];
  messages: FamilyMessage[];
  updatedAt?: string;
  updatedBy?: string;
}

const FAMILY_DOC_REF = doc(db, 'family_state', 'main_v1');
const AUDIT_COLLECTION = collection(db, 'family_audit_logs');

// Subscribe to real-time family data
export function subscribeToFamilyState(
  onData: (state: CloudFamilyState) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(
    FAMILY_DOC_REF,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CloudFamilyState;
        onData(data);
      } else {
        onData({
          members: [],
          familyInfo: {
            familyName: 'شجرة عائلة وفائي',
            bio: 'الشجرة المباركة لذرية وأنساب عائلة وفائي الكريمة',
            history: 'تاريخ عريق وممتد عبر الأجيال'
          },
          news: [],
          photos: [],
          requests: [],
          messages: []
        });
      }
    },
    (err) => {
      console.error('Firestore real-time subscription error:', err);
      if (onError) onError(err);
    }
  );
}

// Subscribe to live audit logs for Admin
export function subscribeToAuditLogs(
  onLogs: (logs: LiveChangeLog[]) => void
) {
  const q = query(AUDIT_COLLECTION, orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: LiveChangeLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as LiveChangeLog);
      });
      onLogs(logs);
    },
    (err) => {
      console.error('Audit logs subscription error:', err);
    }
  );
}

// Save or sync the full family state to Cloud Firestore
export async function syncFamilyStateToCloud(
  state: Partial<CloudFamilyState>,
  actorName: string = 'المدير'
) {
  try {
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName
    };
    await setDoc(FAMILY_DOC_REF, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to sync family state to cloud:', error);
    throw error;
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
