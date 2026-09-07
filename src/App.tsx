import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FamilyMember, 
  RegistrationRequest, 
  NewsItem, 
  FamilyPhoto, 
  FamilyInfo, 
  UserSession, 
  FamilyMessage,
  MemberComment
} from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_NEWS, 
  INITIAL_PHOTOS, 
  INITIAL_INFO,
  INITIAL_MESSAGES
} from './utils/initialData';
import {
  subscribeToMembers,
  subscribeToFamilyInfo,
  subscribeToNews,
  subscribeToPhotos,
  subscribeToRequests,
  subscribeToMessages,
  subscribeToAuditLogs,
  seedInitialMembersIfEmpty,
  syncAllLocalToCloud,
  saveMemberToCloud,
  deleteMemberFromCloud,
  saveMultipleMembersToCloud,
  saveFamilyInfoToCloud,
  saveRequestToCloud,
  deleteRequestFromCloud,
  savePhotoToCloud,
  deletePhotoFromCloud,
  saveNewsToCloud,
  deleteNewsFromCloud,
  saveMessageToCloud,
  deleteMessageFromCloud,
  logFamilyAction,
  deleteAuditLogFromCloud,
  clearAllAuditLogsFromCloud,
  LiveChangeLog
} from './utils/firebaseService';

// Component Imports
import NewsTicker from './components/NewsTicker';
import RoleSimulator from './components/RoleSimulator';
import MainPage from './components/MainPage';
import FamilyTreeVisualizer from './components/FamilyTreeVisualizer';
import MemberProfileEdit from './components/MemberProfileEdit';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ContactAdmin from './components/ContactAdmin';

import { Home, Network, User, Shield, LogOut, MessageSquare, Wifi, Bell, CloudUpload, CheckCircle, LogIn, UserPlus, Image, Headset } from 'lucide-react';
import { reconcileLineageAndMarriages, syncSpouseRelationships, isMemberFemale } from './utils/marriageUtils';
import { findMatchingMemberInTree } from './utils/memberMatching';

// Reconcile fatherName, grandfatherName, childrenIds, and bidirectional spouses across all members
const reconcileLineage = (list: FamilyMember[]): FamilyMember[] => {
  return reconcileLineageAndMarriages(list);
};

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const backupKeys = [
      'family_members_v6',
      'family_members_v5',
      'family_members_v4',
      'family_members_v3',
      'family_members_v2',
      'family_members_v1',
      'family_members',
      'family_tree_data',
      'family_tree_members',
      'tree_members'
    ];
    let maxList: FamilyMember[] = [];
    for (const k of backupKeys) {
      try {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > maxList.length) {
            maxList = parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (maxList.length > 0) return maxList;
    return INITIAL_MEMBERS;
  });

  const [requests, setRequests] = useState<RegistrationRequest[]>(() => {
    const saved = localStorage.getItem('family_requests_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('family_news_v6');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) return p;
      } catch (e) {}
    }
    return INITIAL_NEWS;
  });

  const [photos, setPhotos] = useState<FamilyPhoto[]>(() => {
    const saved = localStorage.getItem('family_photos_v6');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length > 0) return p;
      } catch (e) {}
    }
    return INITIAL_PHOTOS;
  });

  const [familyInfo, setFamilyInfo] = useState<FamilyInfo>(() => {
    const saved = localStorage.getItem('family_info_v7');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_INFO;
  });

  const [messages, setMessages] = useState<FamilyMessage[]>(() => {
    const saved = localStorage.getItem('family_messages_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('family_session_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) {}
    }
    return {
      userId: null,
      name: 'زائر',
      email: '',
      role: 'guest'
    };
  });

  // UI state - default to 'main' so visitors see the main landing page
  const [activeTab, setActiveTab] = useState<'main' | 'tree' | 'profile' | 'admin' | 'messages'>('main');
  const [treeSelectedMemberId, setTreeSelectedMemberId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [auditLogs, setAuditLogs] = useState<LiveChangeLog[]>([]);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => currentSession.role === 'admin');

  // 1. Subscribe to Real-time Collections from Firebase Firestore
  useEffect(() => {
    const unsubMembers = subscribeToMembers((cloudMembers) => {
      const backupKeys = [
        'family_members_v6',
        'family_members_v5',
        'family_members_v4',
        'family_members_v3',
        'family_members_v2',
        'family_members_v1',
        'family_members',
        'family_tree_backup',
        'family_tree_data',
        'family_tree_members',
        'tree_members'
      ];
      let localMaxList: FamilyMember[] = [];
      for (const k of backupKeys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > localMaxList.length) {
              localMaxList = parsed;
            }
          }
        } catch (e) {}
      }

      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(reconcileLineage(cloudMembers));
      } else {
        // If Firestore is empty, auto-upload from local backup or INITIAL_MEMBERS
        if (localMaxList.length > 0) {
          seedInitialMembersIfEmpty(localMaxList);
          setMembers(localMaxList);
          return;
        }
        if (INITIAL_MEMBERS.length > 0) {
          seedInitialMembersIfEmpty(INITIAL_MEMBERS);
          setMembers(INITIAL_MEMBERS);
        }
      }
    });

    const unsubInfo = subscribeToFamilyInfo((info) => {
      if (info && info.familyName) setFamilyInfo(info);
    });

    const unsubNews = subscribeToNews((cloudNews) => {
      setNews(cloudNews || []);
    });

    const unsubPhotos = subscribeToPhotos((cloudPhotos) => {
      setPhotos(cloudPhotos || []);
    });

    const unsubRequests = subscribeToRequests((cloudRequests) => {
      if (cloudRequests) setRequests(cloudRequests);
    });

    const unsubMessages = subscribeToMessages((cloudMessages) => {
      setMessages(cloudMessages || []);
    });

    const unsubLogs = subscribeToAuditLogs((logs) => {
      // Filter logs to ONLY show member modifications (exclude admin, requests, messages)
      const memberLogs = (logs || []).filter(log => {
        const uName = (log.userName || "").toLowerCase();
        const action = (log.action || "").toLowerCase();
        const details = (log.details || "").toLowerCase();
        if (log.userRole === "admin" || uName.includes("admin") || uName.includes("مشرف") || uName.includes("إدارة") || uName.includes("ادارة")) return false;
        if (
          action.includes("طلب") || 
          action.includes("انتساب") || 
          action.includes("تسجيل") || 
          action.includes("رسالة") || 
          action.includes("اعتماد") || 
          action.includes("رفض") ||
          details.includes("طلب انتساب") ||
          details.includes("إرسال رسالة")
        ) return false;
        return true;
      });

      setAuditLogs(memberLogs);
      if (memberLogs.length > 0 && currentSession.role === "admin") {
        const latest = memberLogs[0];
        const logTime = new Date(latest.timestamp).getTime();
        if (Date.now() - logTime < 8000) {
          setLiveNotification(`تعديل من عضو: قام ${latest.userName} بـ ${latest.action} ${latest.targetMemberName ? `(${latest.targetMemberName})` : ""}`);
          setTimeout(() => setLiveNotification(null), 5000);
        }
      }
    });

    return () => {
      unsubMembers();
      unsubInfo();
      unsubNews();
      unsubPhotos();
      unsubRequests();
      unsubMessages();
      unsubLogs();
    };
  }, []);

  // Save to localStorage as quick local cache backup
  useEffect(() => {
    if (members && members.length > 0) {
      localStorage.setItem('family_members_v6', JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    localStorage.setItem('family_messages_v6', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('family_requests_v6', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('family_news_v6', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('family_photos_v6', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('family_info_v7', JSON.stringify(familyInfo));
  }, [familyInfo]);

  useEffect(() => {
    localStorage.setItem('family_session_v6', JSON.stringify(currentSession));
    if (currentSession.role === 'guest' || currentSession.role === 'pending') {
      if (activeTab === 'profile' || activeTab === 'admin') {
        setActiveTab('main');
      }
    } else if (currentSession.role === 'member') {
      if (activeTab === 'admin') setActiveTab('profile');
    }
  }, [currentSession]);

  // Handle Manual Force Cloud Sync Button
  const handleForceSyncToCloud = async () => {
    setIsUploadingToCloud(true);
    try {
      await syncAllLocalToCloud(members, familyInfo, news, photos, messages);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  // Handle Logins
  const handleLogin = (email: string, password?: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Admin login check
    if (
      cleanEmail === 'admin@family.com' ||
      cleanEmail === 'admin' ||
      (password && password.toLowerCase() === 'admin')
    ) {
      setCurrentSession({
        userId: 'admin-id',
        name: 'مدير البوابة (الآدمن)',
        email: 'admin@family.com',
        role: 'admin'
      });
      setIsAdminSession(true);
      setActiveTab('admin');
      return { success: true };
    }

    // 2. Check in Registration Requests (by email)
    const req = requests.find(r => r.email && r.email.trim().toLowerCase() === cleanEmail);
    if (req) {
      if (req.password && password && req.password !== password) {
        return { success: false, message: 'كلمة المرور المدخلة غير صحيحة.' };
      }

      if (req.status === 'pending') {
        return {
          success: false,
          message: `طلب تسجيلك باسم (${req.name} ${isMemberFemale(req) ? 'بنت' : 'بن'} ${req.fatherName} بن ${req.grandfatherName}) تم إرساله وهو حالياً بانتظار مراجعة وقبول الآدمن في لوحة التحكم. لا يمكن تسجيل الدخول إلا بعد اعتماد الحساب وربطه بالشجرة.`
        };
      }

      if (req.status === 'rejected') {
        return {
          success: false,
          message: 'نعتذر، تم رفض طلب التسجيل هذا من قبل إدارة العائلة.'
        };
      }

      if (req.status === 'approved') {
        // Find the member record in the tree created for this approved user
        const member = members.find(m => 
          m.registeredUserId === req.id || 
          (m.email && m.email.trim().toLowerCase() === cleanEmail)
        ) || findMatchingMemberInTree(req, members);

        if (member) {
          setCurrentSession({
            userId: member.id,
            name: `${member.name} ${isMemberFemale(member) ? 'بنت' : 'بن'} ${member.fatherName || ''} بن ${member.grandfatherName || ''}`.trim(),
            email: req.email,
            role: 'member'
          });
          setIsAdminSession(false);
          setActiveTab('tree');
          return { success: true };
        } else {
          // If approved request exists, log in with approved user credentials
          setCurrentSession({
            userId: req.id,
            name: `${req.name} ${isMemberFemale(req) ? 'بنت' : 'بن'} ${req.fatherName} بن ${req.grandfatherName}`,
            email: req.email,
            role: 'member'
          });
          setIsAdminSession(false);
          setActiveTab('tree');
          return { success: true };
        }
      }
    }

    // 3. Check direct tree members with this email
    const directMember = members.find(m => m.email && m.email.trim().toLowerCase() === cleanEmail);
    if (directMember) {
      setCurrentSession({
        userId: directMember.id,
        name: `${directMember.name} ${isMemberFemale(directMember) ? 'بنت' : 'بن'} ${directMember.fatherName || ''} بن ${directMember.grandfatherName || ''}`.trim(),
        email: directMember.email || email,
        role: 'member'
      });
      setIsAdminSession(false);
      setActiveTab('tree');
      return { success: true };
    }

    return {
      success: false,
      message: 'لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني. يرجى تقديم طلب تسجيل جديد أولاً ليتم اعتماده من قِبل إدارة العائلة.'
    };
  };

  const handleLogout = () => {
    setCurrentSession({
      userId: null,
      name: 'زائر العائلة',
      email: '',
      role: 'guest'
    });
    setIsAdminSession(false);
    setActiveTab('main');
  };

  // Handle Registrations (creates pending requests)
  const handleNewRequest = async (newRequest: Omit<RegistrationRequest, "id" | "status" | "createdAt">) => {
    const cleanEmail = newRequest.email.trim().toLowerCase();

    // 1. Check if email is already assigned to an existing member in the tree
    const existingMemberWithEmail = members.find(m => m.email && m.email.trim().toLowerCase() === cleanEmail);
    if (existingMemberWithEmail) {
      const memberName = `${existingMemberWithEmail.name} ${existingMemberWithEmail.fatherName ? 'بن ' + existingMemberWithEmail.fatherName : ''}`.trim();
      return { 
        success: false, 
        message: `نعتذر، هذا البريد الإلكتروني مسجل ومستخدم مسبقاً في الشجرة باسم (${memberName}). بناءً على توجيهات الإدارة، يجب استخدام بريد إلكتروني مستقل وخاص بكل فرد.` 
      };
    }

    // 2. Check if email is already submitted in another request
    const existingReq = requests.find(r => r.email && r.email.trim().toLowerCase() === cleanEmail && r.status !== 'rejected');
    if (existingReq) {
      const reqName = `${existingReq.name} ${existingReq.fatherName ? 'بن ' + existingReq.fatherName : ''}`.trim();
      return { 
        success: false, 
        message: `نعتذر، تم تقديم طلب تسجيل مسبقاً بهذا البريد الإلكتروني باسم (${reqName}). لا يُسمح بتسجيل أكثر من اسم أو شخص بنفس البريد الإلكتروني.` 
      };
    }

    const id = 'req-' + Date.now().toString();
    const request: RegistrationRequest = {
      ...newRequest,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isReadByAdmin: false,
      isReadByMember: true
    };

    try {
      await saveRequestToCloud(request); // This will throw if it fails
      
      const nextRequests = [request, ...requests];
      setRequests(nextRequests);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Approve a request (either linking to existing tree member or creating a new tree node)
  const formatWelcomePhrase = (fullName: string) => {
    let clean = fullName.trim();
    if (clean.startsWith('بـ ') || clean.startsWith('بـ')) {
      clean = clean.replace(/^بـ\s*/, '');
    } else if (clean.startsWith('ب ')) {
      clean = clean.replace(/^ب\s+/, '');
    }
    return `نرحب بـ ${clean}`;
  };

  const handleApproveRequest = async (requestId: string, fatherId: string | null, existingMemberId?: string | null) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    let effectiveMemberId: string;
    let memberFullName: string;

    // 1. Resolve existing member in tree (matching by person's own name in tree)
    let targetExisting: FamilyMember | null = null;
    if (existingMemberId) {
      targetExisting = members.find(m => m.id === existingMemberId) || null;
    }
    if (!targetExisting && !fatherId) {
      targetExisting = findMatchingMemberInTree(req, members);
    }

    if (targetExisting) {
      const existing = targetExisting;
      effectiveMemberId = existing.id;

      const updatedExisting: FamilyMember = {
        ...existing,
        registeredUserId: requestId,
        email: req.email || existing.email,
        country: req.country && req.country !== 'غير محدد' ? req.country : existing.country,
        specialization: req.specialization && req.specialization !== 'غير محدد' ? req.specialization : existing.specialization,
        birthYear: req.birthYear || existing.birthYear,
        birthDate: req.birthDate || existing.birthDate,
        bio: req.bio && req.bio !== 'عضو في العائلة.' ? req.bio : existing.bio,
        avatar: req.avatar || existing.avatar,
        gender: existing.gender || (isMemberFemale(existing) ? 'female' : 'male'),
        isAlive: req.isAlive !== undefined ? req.isAlive : existing.isAlive
      };

      const updatedMembers = members.map(m => m.id === existing.id ? updatedExisting : m);
      const updatedRequest: RegistrationRequest = { ...req, status: 'approved' as const };
      const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);

      const isFemaleReq = isMemberFemale(req) || isMemberFemale(existing);
      const connectorReq = isFemaleReq ? 'بنت' : 'بن';
      const fatherPartReq = (existing.fatherName || req.fatherName) ? ` ${connectorReq} ${existing.fatherName || req.fatherName}` : '';
      const grandPartReq = (existing.grandfatherName || req.grandfatherName) ? ` بن ${existing.grandfatherName || req.grandfatherName}` : '';
      memberFullName = `${existing.name}${fatherPartReq}${grandPartReq}`;

      const newNewsItem: NewsItem = {
        id: 'news-' + Date.now().toString(),
        type: 'welcome',
        content: formatWelcomePhrase(memberFullName),
        createdAt: new Date().toISOString(),
        isReadByAdmin: false,
        isReadByMember: true
      };
      const updatedNews = [newNewsItem, ...news];

      setMembers(updatedMembers);
      setRequests(updatedRequests);
      setNews(updatedNews);

      await saveMemberToCloud(updatedExisting);
      await saveRequestToCloud(updatedRequest);
      await saveNewsToCloud(newNewsItem);
    } else {
      const newMemberId = 'member-' + Date.now().toString();
      effectiveMemberId = newMemberId;
      const newMember: FamilyMember = {
        id: newMemberId,
        name: req.name,
        fatherName: req.fatherName,
        grandfatherName: req.grandfatherName,
        birthYear: req.birthYear,
        birthDate: req.birthDate,
        deathDate: req.deathDate,
        country: req.country,
        specialization: req.specialization,
        isAlive: req.isAlive,
        bio: req.bio,
        avatar: req.avatar,
        spouseName: null,
        fatherId: fatherId,
        childrenIds: [],
        registeredUserId: requestId,
        email: req.email,
        gender: req.gender || (isMemberFemale(req) ? 'female' : 'male')
      };

      let updatedMembers = [...members, newMember];
      let parentToUpdate: FamilyMember | null = null;

      if (fatherId) {
        updatedMembers = updatedMembers.map(m => {
          if (m.id === fatherId) {
            parentToUpdate = {
              ...m,
              childrenIds: [...(m.childrenIds || []), newMemberId]
            };
            return parentToUpdate;
          }
          return m;
        });
      }

      const updatedRequest: RegistrationRequest = { ...req, status: 'approved' as const };
      const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);

      const isFemaleReq = isMemberFemale(req);
      const connectorReq = isFemaleReq ? 'بنت' : 'بن';
      const fatherPartReq = req.fatherName ? ` ${connectorReq} ${req.fatherName}` : '';
      const grandPartReq = req.grandfatherName ? ` بن ${req.grandfatherName}` : '';
      memberFullName = `${req.name}${fatherPartReq}${grandPartReq}`;

      const newNewsItem: NewsItem = {
        id: 'news-' + Date.now().toString(),
        type: 'welcome',
        content: formatWelcomePhrase(memberFullName),
        createdAt: new Date().toISOString(),
        isReadByAdmin: false,
        isReadByMember: true
      };
      const updatedNews = [newNewsItem, ...news];

      setMembers(updatedMembers);
      setRequests(updatedRequests);
      setNews(updatedNews);

      // Save each document individually to Firestore
      await saveMemberToCloud(newMember);
      if (parentToUpdate) await saveMemberToCloud(parentToUpdate);
      await saveRequestToCloud(updatedRequest);
      await saveNewsToCloud(newNewsItem);

    }

    if (currentSession.role === 'pending' && currentSession.requestId === requestId) {
      setCurrentSession({
        userId: effectiveMemberId,
        name: memberFullName,
        email: req.email,
        role: 'member'
      });
      setActiveTab('tree');
    }
  };

  // Reject Request
  const handleRejectRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const updatedRequest: RegistrationRequest = { ...req, status: 'rejected' as const };
    const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);
    setRequests(updatedRequests);
    await saveRequestToCloud(updatedRequest);
    
    if (currentSession.role === 'pending' && currentSession.requestId === requestId) {
      handleLogout();
    }
  };

  // Delete Request completely
  const handleDeleteRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    const updatedRequests = requests.filter(r => r.id !== requestId);
    setRequests(updatedRequests);
    await deleteRequestFromCloud(requestId);
  };

  // Revoke Request back to pending
  const handleRevokeRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const updatedRequest: RegistrationRequest = { ...req, status: 'pending' as const };
    const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);
    setRequests(updatedRequests);
    await saveRequestToCloud(updatedRequest);
  };

  // Helper to diff and get only changed members to avoid massive quota usage
  const getChangedMembers = (prevList: FamilyMember[], nextList: FamilyMember[]) => {
    const changed: FamilyMember[] = [];
    const prevMap = new Map(prevList.map(m => [m.id, JSON.stringify(m)]));
    for (const n of nextList) {
      const pStr = prevMap.get(n.id);
      if (!pStr || pStr !== JSON.stringify(n)) {
        changed.push(n);
      }
    }
    return changed;
  };

  // Member profile updates
  const handleUpdateMember = async (updated: FamilyMember) => {
    const prevMember = members.find(m => m.id === updated.id);
    const syncedWithSpouses = syncSpouseRelationships(members, updated, prevMember);
    const next = reconcileLineageAndMarriages(syncedWithSpouses);
    setMembers(next);
    
    const changed = getChangedMembers(members, next);
    if (changed.length > 0) {
      await saveMultipleMembersToCloud(changed);
    }
    
    // Generate precise diff for audit log
    let diffDetails = 'تحديث بيانات الشجرة';
    if (prevMember) {
      const changes: string[] = [];
      if (prevMember.name !== updated.name) changes.push(`الاسم من "${prevMember.name}" إلى "${updated.name}"`);
      if (prevMember.birthYear !== updated.birthYear) changes.push(`سنة الميلاد من "${prevMember.birthYear || 'غير محدد'}" إلى "${updated.birthYear || 'غير محدد'}"`);
      if (prevMember.country !== updated.country) changes.push(`البلد من "${prevMember.country || 'غير محدد'}" إلى "${updated.country || 'غير محدد'}"`);
      if (prevMember.specialization !== updated.specialization) changes.push(`التخصص من "${prevMember.specialization || 'غير محدد'}" إلى "${updated.specialization || 'غير محدد'}"`);
      if (prevMember.bio !== updated.bio) changes.push(`النبذة الشخصية`);
      if (prevMember.isAlive !== updated.isAlive) changes.push(`الحالة (على قيد الحياة: ${updated.isAlive ? 'نعم' : 'لا'})`);
      if (prevMember.avatar !== updated.avatar) changes.push(`الصورة الشخصية`);
      if (prevMember.spouseName !== updated.spouseName) changes.push(`اسم الزوج/الزوجة من "${prevMember.spouseName || 'لا يوجد'}" إلى "${updated.spouseName || 'لا يوجد'}"`);
      
      if ((prevMember.comments?.length || 0) < (updated.comments?.length || 0)) {
        changes.push(`إضافة تعليق جديد`);
        
        const latestComment = updated.comments![updated.comments!.length - 1];
        const isCommentByAdmin = currentSession.role === 'admin' || 
          latestComment.senderEmail === 'admin@family.com' || 
          latestComment.senderName?.includes('الآدمن') || 
          latestComment.senderName?.includes('مدير');

        // Resolve target member email and identity
        const targetEmail = 
          updated.email || 
          (updated.registeredUserId ? requests.find(r => r.id === updated.registeredUserId)?.email : null) ||
          requests.find(r => r.name && updated.name && r.name.trim() === updated.name.trim())?.email ||
          null;

        const cleanTargetEmail = targetEmail?.trim().toLowerCase();
        const cleanCommenterEmail = latestComment.senderEmail?.trim().toLowerCase();

        // 1. Notify the Member whose profile was commented on
        // (Only if the commenter is NOT the member themselves)
        if (!cleanCommenterEmail || !cleanTargetEmail || cleanCommenterEmail !== cleanTargetEmail) {
          const memberMsg: FamilyMessage = {
            id: 'msg-' + Date.now().toString() + '-m',
            senderName: isCommentByAdmin ? 'إدارة العائلة' : (latestComment.senderName || 'أحد أفراد العائلة'),
            senderEmail: latestComment.senderEmail || 'system@ghanem.family',
            recipientEmail: targetEmail || undefined,
            targetMemberId: updated.id,
            messageType: 'profile_comment_member',
            subject: 'إشعار: تعليق جديد على ملفك الشخصي',
            content: `قام "${latestComment.senderName}" بإضافة تعليق جديد على ملفك الشخصي في شجرة العائلة.\n\nنص التعليق:\n"${latestComment.content}"\n\nتاريخ التعليق: ${latestComment.createdAt}`,
            attachmentType: 'none',
            createdAt: new Date().toISOString(),
            isReadByAdmin: true,    // Do not notify admin that admin or someone commented in member's inbox
            isReadByMember: false,  // Notify the member!
            replies: []
          };
          
          try {
            await saveMessageToCloud(memberMsg);
            setMessages(prev => [memberMsg, ...prev]);
          } catch (e) {
            console.warn('Could not save member notification message');
          }
        }

        // 2. Notify the Admin ONLY IF someone OTHER than the admin commented
        if (!isCommentByAdmin) {
          const adminMsg: FamilyMessage = {
            id: 'msg-' + Date.now().toString() + '-adm',
            senderName: latestComment.senderName || 'عضو في العائلة',
            senderEmail: latestComment.senderEmail || 'visitor@family.com',
            recipientEmail: 'admin@family.com',
            targetMemberId: updated.id,
            messageType: 'profile_comment_admin',
            subject: `تعليق جديد من (${latestComment.senderName}) على ملف (${updated.name})`,
            content: `قام "${latestComment.senderName}" بإضافة تعليق جديد على ملف العضو "${updated.name}" في شجرة العائلة.\n\nنص التعليق:\n"${latestComment.content}"\n\nتاريخ التعليق: ${latestComment.createdAt}`,
            attachmentType: 'none',
            createdAt: new Date().toISOString(),
            isReadByAdmin: false,   // Alert Admin!
            isReadByMember: true,
            replies: []
          };

          try {
            await saveMessageToCloud(adminMsg);
            setMessages(prev => [adminMsg, ...prev]);
            setLiveNotification(`تعليق جديد من ${latestComment.senderName} على ملف ${updated.name}`);
            setTimeout(() => setLiveNotification(null), 6000);
          } catch (e) {
            console.warn('Could not save admin notification message');
          }
        }
      }
      
      if (changes.length > 0) {
        diffDetails = `تم تعديل: ${changes.join('، ')}`;
      } else {
        diffDetails = `لم يتم رصد تغييرات فعلية في الحقول الرئيسية`;
      }
    }
    
    if (currentSession.role === "member") {
      await logFamilyAction(currentSession.name, "تعديل بيانات فرد", diffDetails, updated.name, undefined, "member");
    }
  };

  const handleUpdateMembers = async (newMembers: FamilyMember[]) => {
    const next = reconcileLineage(newMembers);
    setMembers(next);
    const changed = getChangedMembers(members, next);
    if (changed.length > 0) {
      await saveMultipleMembersToCloud(changed);
    }
    if (currentSession.role === "member") {
      await logFamilyAction(currentSession.name, "إعادة ترتيب الأبناء/الأفراد في الشجرة", "تحديث تراتيب العائلة", undefined, undefined, "member");
    }
  };
      

  // Add Child (called by Member or Admin)
  const handleAddChild = async (parentId: string, childInfo: Omit<FamilyMember, 'id' | 'fatherId' | 'childrenIds'>) => {
    const childId = 'member-' + Date.now().toString();
    const parent = members.find(m => m.id === parentId);
    
    const isFemaleParent = isMemberFemale(parent);

    const fatherNode = isFemaleParent ? null : parent;
    const resolvedFatherName = fatherNode ? fatherNode.name : (childInfo.fatherName || '');
    const resolvedGrandfatherName = fatherNode
      ? (fatherNode.fatherId ? (members.find(g => g.id === fatherNode.fatherId)?.name || fatherNode.fatherName || '') : (fatherNode.fatherName || ''))
      : (childInfo.grandfatherName || '');

    const newChild: FamilyMember = {
      ...childInfo,
      id: childId,
      fatherId: isFemaleParent ? null : parentId,
      motherId: isFemaleParent ? parentId : null,
      fatherName: resolvedFatherName,
      grandfatherName: resolvedGrandfatherName,
      childrenIds: []
    };

    let updatedParent: FamilyMember | null = null;
    let updated = [...members, newChild];
    updated = updated.map(m => {
      if (m.id === parentId) {
        updatedParent = {
          ...m,
          childrenIds: [...(m.childrenIds || []), childId]
        };
        return updatedParent;
      }
    return m;
  });

  const reconciled = reconcileLineage(updated);
  setMembers(reconciled);

  const changed = getChangedMembers(members, reconciled);
  if (changed.length > 0) {
    await saveMultipleMembersToCloud(changed);
  }

  if (currentSession.role === "member") {
    await logFamilyAction(currentSession.name, "إضافة ابن/ابنة جديدة", `إضافة ${childInfo.name}`, childInfo.name, undefined, "member");
  }
  };

  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, "id" | "childrenIds">): string => {
  // Add Member Directly (Admin only)
    const id = 'member-' + Date.now().toString();
    const fatherNode = newMem.fatherId ? members.find(m => m.id === newMem.fatherId) : null;
    const resolvedFatherName = fatherNode ? fatherNode.name : (newMem.fatherName || '');
    const resolvedGrandfatherName = fatherNode
      ? (fatherNode.fatherId ? (members.find(g => g.id === fatherNode.fatherId)?.name || fatherNode.fatherName || '') : (fatherNode.fatherName || ''))
      : (newMem.grandfatherName || '');

    const member: FamilyMember = {
      ...newMem,
      fatherName: resolvedFatherName,
      grandfatherName: resolvedGrandfatherName,
      id,
      childrenIds: []
    };

    let parentToUpdate: FamilyMember | null = null;
    let updated = [...members, member];
    if (newMem.fatherId) {
      updated = updated.map(m => {
        if (m.id === newMem.fatherId) {
          parentToUpdate = {
            ...m,
            childrenIds: [...(m.childrenIds || []), id]
          };
          return parentToUpdate;
        }
        return m;
      });
    }

    const syncedWithSpouses = syncSpouseRelationships(updated, member, null);
    const reconciled = reconcileLineageAndMarriages(syncedWithSpouses);
    setMembers(reconciled);
    
    const changed = getChangedMembers(members, reconciled);
    if (changed.length > 0) {
    }

    
    return id;
  };

  // Delete Member (Admin only)
  const handleDeleteMember = async (id: string) => {
    const target = members.find(m => m.id === id);
    let filtered = members.filter(m => m.id !== id);
    filtered = filtered.map(m => {
      if (m.childrenIds.includes(id)) {
        return {
          ...m,
          childrenIds: m.childrenIds.filter(cId => cId !== id)
        };
      }
      return m;
    });
    filtered = filtered.map(m => {
      if (m.fatherId === id) {
        return { ...m, fatherId: null };
      }
      return m;
    });

    setMembers(filtered);
    await deleteMemberFromCloud(id);
    const changed = getChangedMembers(members, filtered);
    if (changed.length > 0) {
      await saveMultipleMembersToCloud(changed);
    }
  };

  // Restore or Bulk Import Members
  const handleRestoreMembers = async (restoredMembers: FamilyMember[]) => {
    if (!restoredMembers || restoredMembers.length === 0) return;
    setMembers(restoredMembers);
    localStorage.setItem('family_members_v6', JSON.stringify(restoredMembers));
    localStorage.setItem('family_tree_backup', JSON.stringify(restoredMembers));
    
  };

  // News management
  const handleAddNews = async (newItem: Omit<NewsItem, 'id' | 'createdAt'>) => {
    const item: NewsItem = {
      ...newItem,
      id: 'news-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      isReadByAdmin: false,
      isReadByMember: true
    };
    try {
      await saveNewsToCloud(item);
      const nextNews = [item, ...news];
      setNews(nextNews);
    } catch (e) {
      console.warn('Could not save news to cloud due to quota limit');
      throw e;
    }
  };

  const handleUpdateNews = async (id: string, updatedFields: Partial<NewsItem>) => {
    const existing = news.find(n => n.id === id);
    if (!existing) return;
    const updated: NewsItem = { ...existing, ...updatedFields };
    try {
      await saveNewsToCloud(updated);
      const nextNews = news.map(n => n.id === id ? updated : n);
      setNews(nextNews);
    } catch (e) {
      console.warn('Could not update news in cloud due to quota limit');
      throw e;
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNewsFromCloud(id);
      const nextNews = news.filter(n => n.id !== id);
      setNews(nextNews);
    } catch (e) {
      console.warn('Could not delete news from cloud due to quota limit');
      throw e;
    }
  };

  // Photos management
  const handleAddPhoto = async (newPhoto: Omit<FamilyPhoto, 'id'>) => {
    const photo: FamilyPhoto = {
      ...newPhoto,
      id: 'photo-' + Date.now().toString()
    };
    const nextPhotos = [photo, ...photos];
    setPhotos(nextPhotos);
    await savePhotoToCloud(photo);
  };

  const handleDeletePhoto = async (id: string) => {
    const nextPhotos = photos.filter(p => p.id !== id);
    setPhotos(nextPhotos);
    await deletePhotoFromCloud(id);
  };

  const handleUpdatePhoto = async (updatedPhoto: FamilyPhoto) => {
    const nextPhotos = photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p);
    setPhotos(nextPhotos);
    await savePhotoToCloud(updatedPhoto);
  };

  const handleAddPhotoComment = async (photoId: string, comment: Omit<MemberComment, 'id' | 'createdAt'>) => {
    const newComment: MemberComment = {
      ...comment,
      id: 'comment-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      isReadByAdmin: false,
      isReadByMember: true
    };
    const targetPhoto = photos.find(p => p.id === photoId);
    if (!targetPhoto) return;
    const updatedPhoto = {
      ...targetPhoto,
      comments: [...(targetPhoto.comments || []), newComment]
    };
    const nextPhotos = photos.map(p => p.id === photoId ? updatedPhoto : p);
    setPhotos(nextPhotos);
    await savePhotoToCloud(updatedPhoto);
  };

  const handleDeletePhotoComment = async (photoId: string, commentId: string) => {
    const targetPhoto = photos.find(p => p.id === photoId);
    if (!targetPhoto) return;
    const updatedPhoto = {
      ...targetPhoto,
      comments: (targetPhoto.comments || []).filter(c => c.id !== commentId)
    };
    const nextPhotos = photos.map(p => p.id === photoId ? updatedPhoto : p);
    setPhotos(nextPhotos);
    await savePhotoToCloud(updatedPhoto);
  };

  const handleSendMessage = async (newMessage: Omit<FamilyMessage, 'id' | 'createdAt'>) => {
    const message: FamilyMessage = {
      ...newMessage,
      id: 'msg-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      isReadByAdmin: false,
      isReadByMember: true
    };
    const nextMessages = [message, ...messages];
    setMessages(nextMessages);
    await saveMessageToCloud(message);
  };

  const handleUpdateMessage = async (updatedMessage: FamilyMessage) => {
    const nextMessages = messages.map(m => m.id === updatedMessage.id ? updatedMessage : m);
    setMessages(nextMessages);
    await saveMessageToCloud(updatedMessage);
  };

  const handleDeleteMessage = async (id: string) => {
    const nextMessages = messages.filter(m => m.id !== id);
    setMessages(nextMessages);
    await deleteMessageFromCloud(id);
  };

  const handleDeleteAuditLog = async (id: string) => {
    const nextLogs = auditLogs.filter(log => log.id !== id);
    setAuditLogs(nextLogs);
    try {
      await deleteAuditLogFromCloud(id);
    } catch (e) {
      console.warn('Could not delete audit log due to quota limit');
    }
  };

  const handleClearAuditLogs = async () => {
    const logsToClear = [...auditLogs];
    setAuditLogs([]);
    try {
      await clearAllAuditLogsFromCloud(logsToClear);
    } catch (e) {
      console.warn('Could not clear audit logs due to quota limit');
    }
  };

  const activeMember = (members || []).find(m => 
    m && (
      m.id === currentSession.userId ||
      (currentSession.userId && m.registeredUserId === currentSession.userId) ||
      (currentSession.email && m.email && m.email.trim().toLowerCase() === currentSession.email.trim().toLowerCase())
    )
  );

  const effectiveNews = useMemo(() => {
    return (news || [])
      .filter(Boolean)
      .map(item => {
        if (item.type === 'welcome' && item.content && item.content.includes('بالعضو الجديد في الموقع:')) {
          return {
            ...item,
            content: item.content.replace(/نرحب بالعضو الجديد في الموقع:\s*/g, 'نرحب بـ ')
          };
        }
        return item;
      });
  }, [news]);

  const hasPendingRequests = (requests || []).some(r => r && r.status === "pending");
  const hasUnreadAdminMessages = useMemo(() => {
    return (messages || []).some(m => {
      if (!m || m.isReadByAdmin !== false) return false;
      if (m.messageType === 'profile_comment_member') return false;
      if (m.recipientEmail && m.recipientEmail !== 'admin@family.com' && m.recipientEmail !== 'system@ghanem.family' && m.subject?.includes('على ملفك الشخصي')) {
        return false;
      }
      return true;
    });
  }, [messages]);

  const hasAdminAlert = hasPendingRequests || hasUnreadAdminMessages;

  const unreadMemberMessagesCount = useMemo(() => {
    if (!currentSession || currentSession.role === "guest") return 0;
    const cleanEmail = currentSession.email?.trim().toLowerCase();
    const cleanUserId = currentSession.userId;
    const activeMemberId = activeMember?.id;

    return (messages || []).filter(m => {
      if (!m || m.isReadByMember !== false) return false;
      
      const recEmail = m.recipientEmail?.trim().toLowerCase();
      const sndEmail = m.senderEmail?.trim().toLowerCase();

      if (cleanEmail && recEmail && recEmail === cleanEmail) return true;
      if (cleanEmail && sndEmail && sndEmail === cleanEmail) return true;
      if (cleanUserId && (m.senderId === cleanUserId || m.targetMemberId === cleanUserId)) return true;
      if (activeMemberId && m.targetMemberId === activeMemberId) return true;
      
      return false;
    }).length;
  }, [messages, currentSession, activeMember]);

  const hasUnreadMemberReply = unreadMemberMessagesCount > 0;
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-12 text-right">
      
      {/* Real-time Notification Banner for Admin */}
      {liveNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-400/30 animate-bounce text-xs md:text-sm font-bold dir-rtl">
          <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
          <span>{liveNotification}</span>
        </div>
      )}

      {/* Top News Ticker */}
      {currentSession.role !== 'guest' && (
        <NewsTicker news={effectiveNews} />
      )}

      {/* Main Navbar */}
      <nav id="main-nav" className={`bg-white border-b border-slate-200/90 py-3 px-4 md:px-6 sticky ${currentSession.role !== 'guest' && effectiveNews && effectiveNews.length > 0 ? 'top-11' : 'top-0'} z-30 shadow-xs text-right`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          
          {/* Right Column (RTL Start): Prestigious Family Title & Location Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex flex-row items-center justify-center gap-2.5 text-right">
              <h1 className="text-xl md:text-2xl font-bold font-serif text-[#414141] tracking-wide leading-none">
                آل الوفائي والعطائي
              </h1>
              <span className="inline-flex items-center justify-center self-center sm:self-auto text-[11px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 whitespace-nowrap">
                سوريا / حمص
              </span>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* Center Column: Nav Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'main' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home size={14} />
              الرئيسية
            </button>
            
            {/* Family Tree Tab - Visible ONLY to Approved Members & Admins */}
            {(currentSession.role === 'member' || currentSession.role === 'admin') && (
              <button
                onClick={() => setActiveTab('tree')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'tree' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Network size={14} />
                شجرة العائلة
              </button>
            )}

            {/* Admin Tab */}
            {currentSession.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield size={14} />
                لوحة الإدارة
                {hasAdminAlert ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#bb5791] animate-pulse inline-block mr-1 shadow-sm"></span>
                ) : auditLogs.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1"></span>
                )}
              </button>
            )}
          </div>

          {/* Left Column (RTL End): Auth buttons for Guests, or User Profile & Logout for members */}
          <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
            {currentSession.role === 'guest' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthMode('login')}
                  className="flex items-center gap-1.5 bg-[#414141] hover:bg-[#333333] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <LogIn size={14} />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <UserPlus size={14} />
                  <span>طلب حساب جديد</span>
                </button>
              </div>
            ) : (
              <>
                {currentSession.role === 'member' && (
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`relative p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      activeTab === 'messages'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : hasUnreadMemberReply
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-slate-50 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border-slate-200/60'
                    }`}
                    title={hasUnreadMemberReply ? `لديك ${unreadMemberMessagesCount} إشعار جديد` : "الرسائل والإشعارات"}
                  >
                    <Bell size={18} />
                    {hasUnreadMemberReply && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#bb5791] text-white text-[9px] font-extrabold animate-pulse">
                        {unreadMemberMessagesCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (activeMember) {
                      setActiveTab('profile');
                    } else if (currentSession.role === 'admin') {
                      setActiveTab('admin');
                    }
                  }}
                  className={`relative group p-2.5 rounded-full transition-all border flex items-center justify-center cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border-slate-200/60'
                  }`}
                  title={activeMember ? "تعديل الملف الشخصي والبيانات" : (currentSession.role === 'admin' ? "لوحة الإدارة" : `الملف الشخصي: ${currentSession.name}`)}
                >
                  <User size={18} />
                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                    activeTab === 'profile'
                      ? 'bg-white'
                      : currentSession.role === 'admin' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                </button>

                <div 
                  onClick={() => {
                    if (activeMember) {
                      setActiveTab('profile');
                    } else if (currentSession.role === 'admin') {
                      setActiveTab('admin');
                    }
                  }}
                  className="hidden lg:block text-right cursor-pointer"
                  title={activeMember ? "الانتقال لصفحة التعديلات" : undefined}
                >
                  <span className="block text-[9px] text-slate-400 font-bold leading-none">مرحباً بك</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] block hover:text-indigo-600 transition-colors">{currentSession.name}</span>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </nav>

      {/* Main Body Grid */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 w-full flex-1 pt-1">
        
        {/* Pending Request Status Notice Box (if pending) */}
        {currentSession.role === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 dir-rtl text-right">
            <div>
              <h4 className="font-bold text-amber-900 text-sm md:text-base flex items-center gap-1">
                طلب التسجيل الخاص بك قيد المراجعة والربط ⏳
              </h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                مرحباً {currentSession.name}. تم إرسال طلب تسجيلك بنجاح وهو معروض على الآدمن لمطابقته والربط بالوالد المناسب في الشجرة. 
              </p>
            </div>
          </div>
        )}

        {/* Tab router views */}
        <div className="py-2">
          {activeTab === 'main' && (
            <MainPage
              familyInfo={familyInfo}
              photos={photos}
              members={members}
              isAdmin={currentSession.role === 'admin'}
              isGuest={currentSession.role === 'guest'}
              currentSession={currentSession}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onUpdatePhoto={handleUpdatePhoto}
              onAddPhotoComment={handleAddPhotoComment}
              onDeletePhotoComment={handleDeletePhotoComment}
              onUpdateInfo={async (info) => {
                setFamilyInfo(info);
                await saveFamilyInfoToCloud(info);
              }}
              onGoToTree={(memberId?: string) => {
                if (memberId) setTreeSelectedMemberId(memberId);
                setActiveTab('tree');
              }}
              onOpenAuth={(mode) => setAuthMode(mode || 'login')}
              onOpenRegister={() => setAuthMode('register')}
            />
          )}

          {activeTab === 'tree' && (
            <FamilyTreeVisualizer
              members={members}
              initialSelectedMemberId={treeSelectedMemberId}
              onClearInitialSelection={() => setTreeSelectedMemberId(null)}
              isApprovedMember={currentSession.role === 'member' || currentSession.role === 'admin'}
              onOpenAuth={() => setAuthMode('login')}
              isAdmin={currentSession.role === 'admin'}
              onAddMemberDirectly={handleAddMemberDirectly}
              onDeleteMember={handleDeleteMember}
              onUpdateMember={handleUpdateMember}
              onUpdateMembers={handleUpdateMembers}
              currentSession={currentSession}
            />
          )}

          {activeTab === 'profile' && (
            activeMember ? (
              <MemberProfileEdit
                member={activeMember}
                allMembers={members}
                onUpdateMember={handleUpdateMember}
                onAddChild={handleAddChild}
                onGoToTree={(id) => {
                  setActiveTab('tree');
                  if (id) setTreeSelectedMemberId(id);
                }}
                onLogout={handleLogout}
              />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <User size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">جاري تحميل بيانات العضو...</h3>
                <p className="text-xs text-slate-500">إذا لم تكن مرتبطاً بفرد محدد في الشجرة بعد، يرجى التواصل مع مسؤول العائلة لربط حسابك.</p>
                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab('main')}
                    className="bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    العودة للرئيسية
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'admin' && currentSession.role === 'admin' && (
            <AdminPanel
              requests={requests}
              members={members}
              news={news}
              photos={photos}
              messages={messages}
              currentSession={currentSession}
              onUpdateMessage={handleUpdateMessage}
              auditLogs={auditLogs}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onDeleteRequest={handleDeleteRequest}
              onRevokeRequest={handleRevokeRequest}
              onAddNews={handleAddNews}
              onUpdateNews={handleUpdateNews}
              onDeleteNews={handleDeleteNews}
              onDeleteMember={handleDeleteMember}
              onAddMemberDirectly={handleAddMemberDirectly}
              onUpdateMember={handleUpdateMember}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onAddPhotoComment={handleAddPhotoComment}
              onDeletePhotoComment={handleDeletePhotoComment}
              onDeleteMessage={handleDeleteMessage}
              onDeleteAuditLog={handleDeleteAuditLog}
              onClearAuditLogs={handleClearAuditLogs}
              onRestoreMembers={handleRestoreMembers}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'messages' && (
            <ContactAdmin
              messages={messages}
              currentSession={currentSession}
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
            />
          )}
        </div>

      </main>

      {/* Collapsible interactive role testing simulator - Admin Only */}
      {isAdminSession && (
        <RoleSimulator
          currentSession={currentSession}
          onChangeSession={setCurrentSession}
          pendingCount={requests.filter(r => r.status === 'pending').length}
        />
      )}

      {/* Auth Login/Register Modal */}
      <AuthModal
        isOpen={authMode !== null}
        initialMode={authMode || 'login'}
        onClose={() => setAuthMode(null)}
        onRegister={handleNewRequest}
        onLogin={handleLogin}
      />

      {/* Floating Contact Admin Button - Visible ONLY to Logged-in Members (Hidden for Admin) */}
      {currentSession.role === 'member' && (
        <button
          onClick={() => {
            if (activeTab === 'messages') {
              setActiveTab('main');
            } else {
              setActiveTab('messages');
            }
          }}
          className={`fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-100'
          }`}
          id="floating-contact-btn"
        >
          <div className="relative">
            {activeTab === 'messages' ? <LogOut size={20} className="rotate-180" /> : <Headset size={22} />}
            {hasUnreadMemberReply && activeTab !== "messages" && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#bb5791] border-2 border-white rounded-full flex items-center justify-center text-[9px] font-extrabold text-white animate-pulse">
                {unreadMemberMessagesCount}
              </span>
            )}
          </div>
        </button>
      )}

    </div>
  );
}
