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
import UserProfileModal from './components/UserProfileModal';

import { Home, Network, User, Shield, LogOut, MessageSquare, Wifi, Bell, CloudUpload, CheckCircle, LogIn, UserPlus, Image } from 'lucide-react';
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      setAuditLogs(logs);
      if (logs.length > 0 && currentSession.role === 'admin') {
        const latest = logs[0];
        const logTime = new Date(latest.timestamp).getTime();
        if (Date.now() - logTime < 8000) {
          setLiveNotification(`تحديث حي: قام ${latest.userName} بـ ${latest.action} ${latest.targetMemberName ? `(${latest.targetMemberName})` : ''}`);
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
          message: `طلب تسجيلك باسم (${req.name} ${req.gender === 'female' ? 'بنت' : 'بن'} ${req.fatherName} بن ${req.grandfatherName}) تم إرساله وهو حالياً بانتظار مراجعة وقبول الآدمن في لوحة التحكم. لا يمكن تسجيل الدخول إلا بعد اعتماد الحساب وربطه بالشجرة.`
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
            name: `${req.name} ${req.gender === 'female' ? 'بنت' : 'بن'} ${req.fatherName} بن ${req.grandfatherName}`,
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
  const handleRegister = async (newRequest: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => {
    const cleanEmail = newRequest.email.trim().toLowerCase();
    
    if (members.some(m => m.email?.trim().toLowerCase() === cleanEmail)) {
      return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل كعضو في العائلة.' };
    }
    if (requests.some(r => r.email?.trim().toLowerCase() === cleanEmail && r.status !== 'rejected')) {
      return { success: false, message: 'يوجد طلب تسجيل معلق أو معتمد بهذا البريد الإلكتروني.' };
    }

    const id = 'req-' + Date.now().toString();
    const request: RegistrationRequest = {
      ...newRequest,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await saveRequestToCloud(request); // This will throw if it fails
      
      const nextRequests = [request, ...requests];
      setRequests(nextRequests);
      await logFamilyAction(newRequest.name, 'طلب تسجيل جديد', `طلب انتساب جديد قيد مراجعة الآدمن`, newRequest.name, newRequest.email);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Approve a request (either linking to existing tree member or creating a new tree node)
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
        gender: req.gender || existing.gender,
        isAlive: req.isAlive !== undefined ? req.isAlive : existing.isAlive
      };

      const updatedMembers = members.map(m => m.id === existing.id ? updatedExisting : m);
      const updatedRequest: RegistrationRequest = { ...req, status: 'approved' as const };
      const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);

      const isFemaleReq = (req.gender || existing.gender) === 'female';
      const connectorReq = isFemaleReq ? 'بنت' : 'بن';
      const fatherPartReq = (existing.fatherName || req.fatherName) ? ` ${connectorReq} ${existing.fatherName || req.fatherName}` : '';
      const grandPartReq = (existing.grandfatherName || req.grandfatherName) ? ` بن ${existing.grandfatherName || req.grandfatherName}` : '';
      memberFullName = `${existing.name}${fatherPartReq}${grandPartReq}`;

      const newNewsItem: NewsItem = {
        id: 'news-' + Date.now().toString(),
        type: 'welcome',
        content: `نرحب بالعضو الجديد في الموقع: ${memberFullName}`,
        createdAt: new Date().toISOString()
      };
      const updatedNews = [newNewsItem, ...news];

      setMembers(updatedMembers);
      setRequests(updatedRequests);
      setNews(updatedNews);

      await saveMemberToCloud(updatedExisting);
      await saveRequestToCloud(updatedRequest);
      await saveNewsToCloud(newNewsItem);
      await logFamilyAction(currentSession.name, 'ربط واعتماد حساب مسجل', `تم ربط حساب ${req.name} (${req.email}) مع الفرد الموجود بالشجرة بنفس اسمه: ${existing.name}`, existing.name);
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
        gender: req.gender || 'male'
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

      const isFemaleReq = req.gender === 'female';
      const connectorReq = isFemaleReq ? 'بنت' : 'بن';
      const fatherPartReq = req.fatherName ? ` ${connectorReq} ${req.fatherName}` : '';
      const grandPartReq = req.grandfatherName ? ` بن ${req.grandfatherName}` : '';
      memberFullName = `${req.name}${fatherPartReq}${grandPartReq}`;

      const newNewsItem: NewsItem = {
        id: 'news-' + Date.now().toString(),
        type: 'welcome',
        content: `نرحب بالعضو الجديد في الموقع: ${memberFullName}`,
        createdAt: new Date().toISOString()
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

      await logFamilyAction(currentSession.name, 'موافقة على عضو جديد', `تم اعتماد وقبول حساب ${req.name} وإضافته للشجرة`, req.name);
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
    await logFamilyAction(currentSession.name, 'حذف طلب تسجيل', `تم حذف طلب التسجيل للمستخدم: ${req?.name || requestId}`, req?.name);
  };

  // Revoke Request back to pending
  const handleRevokeRequest = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const updatedRequest: RegistrationRequest = { ...req, status: 'pending' as const };
    const updatedRequests = requests.map(r => r.id === requestId ? updatedRequest : r);
    setRequests(updatedRequests);
    await saveRequestToCloud(updatedRequest);
    await logFamilyAction(currentSession.name, 'إلغاء اعتماد طلب', `تم إعادة طلب ${req.name} إلى قيد الانتظار لإعادة ضبطه`, req.name);
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
    await logFamilyAction(currentSession.name, 'تعديل بيانات فرد', `تحديث بيانات الشجرة`, updated.name);
  };

  const handleUpdateMembers = async (newMembers: FamilyMember[]) => {
    const next = reconcileLineage(newMembers);
    setMembers(next);
    const changed = getChangedMembers(members, next);
    if (changed.length > 0) {
      await saveMultipleMembersToCloud(changed);
    }
    await logFamilyAction(currentSession.name, 'إعادة ترتيب الأبناء/الأفراد في الشجرة', 'تحديث تراتيب العائلة');
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
    await logFamilyAction(currentSession.name, 'إضافة ابن/ابنة جديدة', `إضافة ${childInfo.name}`, childInfo.name);
  };

  // Add Member Directly (Admin only)
  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, 'id' | 'childrenIds'>): string => {
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
      saveMultipleMembersToCloud(changed);
    }

    logFamilyAction(currentSession.name, 'إضافة عضو مباشرة إلى الشجرة', newMem.name, newMem.name);
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
    await logFamilyAction(currentSession.name, 'حذف عضو من الشجرة', target?.name || id, target?.name);
  };

  // Restore or Bulk Import Members
  const handleRestoreMembers = async (restoredMembers: FamilyMember[]) => {
    if (!restoredMembers || restoredMembers.length === 0) return;
    setMembers(restoredMembers);
    localStorage.setItem('family_members_v6', JSON.stringify(restoredMembers));
    localStorage.setItem('family_tree_backup', JSON.stringify(restoredMembers));
    await seedInitialMembersIfEmpty(restoredMembers);
    await logFamilyAction(currentSession.name, 'استعادة بيانات الشجرة', `تم استعادة وتثبيت ${restoredMembers.length} فرد في الشجرة`);
  };

  // News management
  const handleAddNews = async (newItem: Omit<NewsItem, 'id' | 'createdAt'>) => {
    const item: NewsItem = {
      ...newItem,
      id: 'news-' + Date.now().toString(),
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };
    const nextMessages = [message, ...messages];
    setMessages(nextMessages);
    await saveMessageToCloud(message);
    await logFamilyAction(newMessage.senderName, 'إرسال رسالة للإدارة', newMessage.subject, undefined, newMessage.senderEmail);
  };

  const handleDeleteMessage = async (id: string) => {
    const nextMessages = messages.filter(m => m.id !== id);
    setMessages(nextMessages);
    await deleteMessageFromCloud(id);
  };

  const activeMember = members.find(m => 
    m.id === currentSession.userId ||
    (currentSession.userId && m.registeredUserId === currentSession.userId) ||
    (currentSession.email && m.email && m.email.trim().toLowerCase() === currentSession.email.trim().toLowerCase())
  );

  const effectiveNews = useMemo(() => {
    return news || [];
  }, [news]);

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
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-center sm:text-right">
              <h1 className="text-xl md:text-2xl font-bold font-serif text-[#414141] tracking-wide leading-none">
                آل الوفائي والعطائي
              </h1>
              <span className="inline-flex items-center justify-center self-center sm:self-auto text-[11px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 whitespace-nowrap">
                سوريا / حمص
              </span>
            </div>
          </div>

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

            {/* Approved Member Tab */}
            {currentSession.role === 'member' && activeMember && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User size={14} />
                تعديل عائلتي
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
                {auditLogs.length > 0 && (
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
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="relative group p-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/60 flex items-center justify-center bg-slate-50 text-slate-700 hover:text-indigo-600 cursor-pointer"
                  title={`الملف الشخصي: ${currentSession.name}`}
                >
                  <User size={18} />
                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                    currentSession.role === 'admin' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                </button>

                <div className="hidden lg:block text-right">
                  <span className="block text-[9px] text-slate-400 font-bold leading-none">مرحباً بك</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] block">{currentSession.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-2.5 rounded-full transition-colors border border-slate-200/50 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
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

          {activeTab === 'profile' && activeMember && (
            <MemberProfileEdit
              member={activeMember}
              allMembers={members}
              onUpdateMember={handleUpdateMember}
              onAddChild={handleAddChild}
            />
          )}

          {activeTab === 'admin' && currentSession.role === 'admin' && (
            <AdminPanel
              requests={requests}
              members={members}
              news={news}
              photos={photos}
              messages={messages}
              currentSession={currentSession}
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
              onRestoreMembers={handleRestoreMembers}
            />
          )}

          {activeTab === 'messages' && (
            <ContactAdmin
              currentSession={currentSession}
              onSendMessage={handleSendMessage}
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
        onRegister={handleRegister}
        onLogin={handleLogin}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentSession={currentSession}
        activeMember={activeMember}
        onLogout={handleLogout}
        onGoToTree={(id) => {
          setActiveTab('tree');
          if (id) setTreeSelectedMemberId(id);
        }}
        onGoToProfileEdit={() => setActiveTab('profile')}
        onGoToAdmin={() => setActiveTab('admin')}
      />

      {/* Floating Contact Admin Button - Visible ONLY to Logged-in Members and Admins */}
      {currentSession.role !== 'guest' && (
        <button
          onClick={() => {
            if (activeTab === 'messages') {
              setActiveTab('main');
            } else {
              setActiveTab('messages');
            }
          }}
          className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-100'
          }`}
          id="floating-contact-btn"
        >
          <MessageSquare size={15} />
          <span>{activeTab === 'messages' ? 'العودة للرئيسية' : 'مراسلة الإدارة'}</span>
        </button>
      )}

    </div>
  );
}
