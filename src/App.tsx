import React, { useState, useEffect, useRef } from 'react';
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

import { Home, Network, User, Shield, LogOut, MessageSquare, Wifi, Bell, CloudUpload, CheckCircle, LogIn, UserPlus } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('family_members_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
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
      userId: 'admin-id',
      name: 'مدير البوابة (الآدمن)',
      email: 'admin@family.com',
      role: 'admin'
    };
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'main' | 'tree' | 'profile' | 'admin' | 'messages'>('tree');
  const [treeSelectedMemberId, setTreeSelectedMemberId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<LiveChangeLog[]>([]);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 1. Subscribe to Real-time Collections from Firebase Firestore
  useEffect(() => {
    const unsubMembers = subscribeToMembers((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
      } else {
        // If Firestore is empty, auto-upload current local members if available
        const localSaved = localStorage.getItem('family_members_v6');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              seedInitialMembersIfEmpty(parsed);
              setMembers(parsed);
              return;
            }
          } catch (e) {}
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
      if (cloudNews && cloudNews.length > 0) setNews(cloudNews);
    });

    const unsubPhotos = subscribeToPhotos((cloudPhotos) => {
      if (cloudPhotos && cloudPhotos.length > 0) {
        setPhotos(cloudPhotos);
      }
    });

    const unsubRequests = subscribeToRequests((cloudRequests) => {
      if (cloudRequests) setRequests(cloudRequests);
    });

    const unsubMessages = subscribeToMessages((cloudMessages) => {
      if (cloudMessages) setMessages(cloudMessages);
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
  const handleLogin = (email: string, role: 'admin' | 'member'): boolean => {
    if (role === 'admin') {
      setCurrentSession({
        userId: 'admin-id',
        name: 'مدير البوابة (الآدمن)',
        email: 'admin@family.com',
        role: 'admin'
      });
      setActiveTab('admin');
      return true;
    } else {
      const member = members.find(m => m.id === 'member-1-2') || members[0];
      if (member) {
        setCurrentSession({
          userId: member.id,
          name: `${member.name} بن ${member.fatherName || ''} بن ${member.grandfatherName || ''}`.trim(),
          email: email,
          role: 'member'
        });
        setActiveTab('tree');
        return true;
      }
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentSession({
      userId: null,
      name: 'زائر العائلة',
      email: '',
      role: 'guest'
    });
    setActiveTab('main');
  };

  // Handle Registrations (creates pending requests)
  const handleRegister = async (newRequest: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => {
    const id = 'req-' + Date.now().toString();
    const request: RegistrationRequest = {
      ...newRequest,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const nextRequests = [request, ...requests];
    setRequests(nextRequests);
    await saveRequestToCloud(request);
    await logFamilyAction(newRequest.name, 'طلب تسجيل جديد', `طلب انتساب جديد قيد مراجعة الآدمن`, newRequest.name, newRequest.email);

    setCurrentSession({
      userId: id,
      name: `${newRequest.name} بن ${newRequest.fatherName} بن ${newRequest.grandfatherName}`,
      email: newRequest.email,
      role: 'pending',
      requestId: id
    });
  };

  // Approve a request
  const handleApproveRequest = async (requestId: string, fatherId: string | null) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const newMemberId = 'member-' + Date.now().toString();
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
      registeredUserId: requestId
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
    
    const newNewsItem: NewsItem = {
      id: 'news-' + Date.now().toString(),
      type: 'welcome',
      content: `نرحب ترحيباً حاراً بانضمام العضو الجديد للشجرة المباركة: ${req.name} بن ${req.fatherName} بن ${req.grandfatherName} من بلد الإقامة ${req.country}!`,
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

    await logFamilyAction(currentSession.name, 'موافقة على عضو جديد', `تم اعتماد وقبول حساب ${req.name} وربطه بالشجرة`, req.name);

    if (currentSession.role === 'pending' && currentSession.requestId === requestId) {
      setCurrentSession({
        userId: newMemberId,
        name: `${req.name} بن ${req.fatherName} بن ${req.grandfatherName}`,
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

  // Member profile updates
  const handleUpdateMember = async (updated: FamilyMember) => {
    let next = members.map(m => m.id === updated.id ? updated : m);
    
    const childrenMap: Record<string, string[]> = {};
    next.forEach(m => {
      if (m.fatherId) {
        if (!childrenMap[m.fatherId]) childrenMap[m.fatherId] = [];
        childrenMap[m.fatherId].push(m.id);
      }
      if (m.motherId) {
        if (!childrenMap[m.motherId]) childrenMap[m.motherId] = [];
        childrenMap[m.motherId].push(m.id);
      }
    });
    next = next.map(m => {
      const correctChildren = childrenMap[m.id] || [];
      if (JSON.stringify(m.childrenIds || []) !== JSON.stringify(correctChildren)) {
        return { ...m, childrenIds: correctChildren };
      }
      return m;
    });

    setMembers(next);
    await saveMemberToCloud(updated);
    await logFamilyAction(currentSession.name, 'تعديل بيانات فرد', `تحديث بيانات الشجرة`, updated.name);
  };

  const handleUpdateMembers = async (newMembers: FamilyMember[]) => {
    let next = [...newMembers];
    const childrenMap: Record<string, string[]> = {};
    next.forEach(m => {
      if (m.fatherId) {
        if (!childrenMap[m.fatherId]) childrenMap[m.fatherId] = [];
        childrenMap[m.fatherId].push(m.id);
      }
      if (m.motherId) {
        if (!childrenMap[m.motherId]) childrenMap[m.motherId] = [];
        childrenMap[m.motherId].push(m.id);
      }
    });
    next = next.map(m => {
      const correctChildren = childrenMap[m.id] || [];
      if (JSON.stringify(m.childrenIds || []) !== JSON.stringify(correctChildren)) {
        return { ...m, childrenIds: correctChildren };
      }
      return m;
    });

    setMembers(next);
    await saveMultipleMembersToCloud(next);
    await logFamilyAction(currentSession.name, 'إعادة ترتيب الأبناء/الأفراد في الشجرة', 'تحديث تراتيب العائلة');
  };

  // Add Child (called by Member or Admin)
  const handleAddChild = async (parentId: string, childInfo: Omit<FamilyMember, 'id' | 'fatherId' | 'childrenIds'>) => {
    const childId = 'member-' + Date.now().toString();
    const parent = members.find(m => m.id === parentId);
    
    const isFemaleName = (name: string): boolean => {
      const femaleNames = ['فاطمة', 'سارة', 'هند', 'نور', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'أميرة', 'عائشة', 'فاطمه', 'ساره', 'مريم', 'زينب', 'خديجة', 'رندة', 'ليلى', 'رنا', 'رانية', 'هالة', 'منى', 'سهى'];
      if (!name) return false;
      const firstWord = name.trim().split(' ')[0];
      return femaleNames.includes(firstWord);
    };

    const isFemaleParent = parent?.gender === 'female' || (parent && isFemaleName(parent.name));

    const newChild: FamilyMember = {
      ...childInfo,
      id: childId,
      fatherId: isFemaleParent ? null : parentId,
      motherId: isFemaleParent ? parentId : null,
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

    setMembers(updated);
    await saveMemberToCloud(newChild);
    if (updatedParent) await saveMemberToCloud(updatedParent);
    await logFamilyAction(currentSession.name, 'إضافة ابن/ابنة جديدة', `إضافة ${childInfo.name}`, childInfo.name);
  };

  // Add Member Directly (Admin only)
  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, 'id' | 'childrenIds'>): string => {
    const id = 'member-' + Date.now().toString();
    const member: FamilyMember = {
      ...newMem,
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

    setMembers(updated);
    saveMemberToCloud(member);
    if (parentToUpdate) saveMemberToCloud(parentToUpdate);
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
    await saveMultipleMembersToCloud(filtered);
    await logFamilyAction(currentSession.name, 'حذف عضو من الشجرة', target?.name || id, target?.name);
  };

  // News management
  const handleAddNews = async (newItem: Omit<NewsItem, 'id' | 'createdAt'>) => {
    const item: NewsItem = {
      ...newItem,
      id: 'news-' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const nextNews = [item, ...news];
    setNews(nextNews);
    await saveNewsToCloud(item);
  };

  const handleUpdateNews = async (id: string, updatedFields: Partial<NewsItem>) => {
    const existing = news.find(n => n.id === id);
    if (!existing) return;
    const updated: NewsItem = { ...existing, ...updatedFields };
    const nextNews = news.map(n => n.id === id ? updated : n);
    setNews(nextNews);
    await saveNewsToCloud(updated);
  };

  const handleDeleteNews = async (id: string) => {
    const nextNews = news.filter(n => n.id !== id);
    setNews(nextNews);
    await deleteNewsFromCloud(id);
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

  const activeMember = members.find(m => m.id === currentSession.userId);

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
      <NewsTicker news={news} />

      {/* Main Navbar */}
      <nav id="main-nav" className={`bg-white border-b border-slate-200 py-4 px-4 sticky ${news && news.length > 0 ? 'top-11' : 'top-0'} z-30 shadow-xs text-right`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          
          {/* Nav Tabs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'main' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home size={14} />
              الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'tree' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Network size={14} />
              شجرة العائلة
            </button>

            {/* Approved Member Tab */}
            {currentSession.role === 'member' && activeMember && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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

          {/* Center Column: Header Title with Family Crest */}
          <div className="text-center py-1 md:py-0 flex items-center justify-center gap-2.5">
            <img 
              src="/family_logo.png" 
              alt="شعار آل الوفائي والعطائي" 
              className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 font-serif tracking-wide">
              عائلة آل الوفائي والعطائي
            </h1>
          </div>

          {/* Left Column: User Profile Controls & Auth Buttons */}
          <div className="flex items-center justify-center md:justify-end gap-2">
            {currentSession.role === 'guest' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthMode('login')}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
                  title="تسجيل الدخول للحساب"
                >
                  <LogIn size={14} />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-xs cursor-pointer"
                  title="تقديم طلب انضمام / إنشاء حساب جديد"
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
                  className="bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-2.5 rounded-full transition-colors border border-slate-200/50"
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
      <main id="main-content" className="max-w-7xl mx-auto px-4 w-full flex-1 pt-6">
        
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
              onOpenAuth={() => setAuthMode('login')}
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

      {/* Collapsible interactive role testing simulator */}
      <RoleSimulator
        currentSession={currentSession}
        onChangeSession={setCurrentSession}
        pendingCount={requests.filter(r => r.status === 'pending').length}
      />

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

      {/* Floating Contact Admin Button */}
      <button
        onClick={() => {
          if (activeTab === 'messages') {
            setActiveTab('main');
          } else {
            setActiveTab('messages');
          }
        }}
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
          activeTab === 'messages'
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-200'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-100'
        }`}
        id="floating-contact-btn"
      >
        <MessageSquare size={15} />
        <span>{activeTab === 'messages' ? 'العودة للرئيسية' : 'مراسلة الإدارة'}</span>
      </button>

    </div>
  );
}
