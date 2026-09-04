import { useState, useEffect } from 'react';
import { 
  FamilyMember, 
  RegistrationRequest, 
  NewsItem, 
  FamilyPhoto, 
  FamilyInfo, 
  UserSession, 
  UserRole,
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

// Component Imports
import NewsTicker from './components/NewsTicker';
import RoleSimulator from './components/RoleSimulator';
import MainPage from './components/MainPage';
import FamilyTreeVisualizer from './components/FamilyTreeVisualizer';
import MemberProfileEdit from './components/MemberProfileEdit';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ContactAdmin from './components/ContactAdmin';

import { Home, Network, User, Shield, LogIn, LogOut, Info, Heart, MessageSquare } from 'lucide-react';

export default function App() {
  // LocalStorage state syncing
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('family_members_v6');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [requests, setRequests] = useState<RegistrationRequest[]>(() => {
    const saved = localStorage.getItem('family_requests_v6');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('family_news_v6');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [photos, setPhotos] = useState<FamilyPhoto[]>(() => {
    const saved = localStorage.getItem('family_photos_v6');
    if (saved) {
      return JSON.parse(saved) as FamilyPhoto[];
    }
    return INITIAL_PHOTOS;
  });

  const [familyInfo, setFamilyInfo] = useState<FamilyInfo>(() => {
    const saved = localStorage.getItem('family_info_v7');
    return saved ? JSON.parse(saved) : INITIAL_INFO;
  });

  const [messages, setMessages] = useState<FamilyMessage[]>(() => {
    const saved = localStorage.getItem('family_messages_v6');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('family_session_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.role === 'admin') return parsed;
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('family_members_v6', JSON.stringify(members));
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
    // Auto adjust tabs if permissions change
    if (currentSession.role === 'guest' || currentSession.role === 'pending') {
      if (activeTab === 'profile' || activeTab === 'admin') {
        setActiveTab('main');
      }
    } else if (currentSession.role === 'member') {
      if (activeTab === 'admin') setActiveTab('profile');
    } else if (currentSession.role === 'admin') {
      if (activeTab === 'profile') setActiveTab('admin');
    }
  }, [currentSession]);

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
      // Find matching approved member in our directory (e.g. ahmed)
      const member = members.find(m => m.id === 'member-1-2'); // default demo to "أحمد"
      if (member) {
        setCurrentSession({
          userId: member.id,
          name: `${member.name} بن ${member.fatherName} بن ${member.grandfatherName}`,
          email: email,
          role: 'member'
        });
        setActiveTab('profile');
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
  const handleRegister = (newRequest: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => {
    const id = 'req-' + Date.now().toString();
    const request: RegistrationRequest = {
      ...newRequest,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [request, ...prev]);

    // Set temporary pending session
    setCurrentSession({
      userId: id,
      name: `${newRequest.name} بن ${newRequest.fatherName} بن ${newRequest.grandfatherName}`,
      email: newRequest.email,
      role: 'pending',
      requestId: id
    });
  };

  // Approve a request
  const handleApproveRequest = (requestId: string, fatherId: string | null) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Create new family member
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

    // Update members list
    setMembers(prevMembers => {
      let updated = [...prevMembers, newMember];
      // Connect to father's childrenIds if linked
      if (fatherId) {
        updated = updated.map(m => {
          if (m.id === fatherId) {
            return {
              ...m,
              childrenIds: [...(m.childrenIds || []), newMemberId]
            };
          }
          return m;
        });
      }
      return updated;
    });

    // Mark request as approved
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));

    // Post AUTOMATED Welcome News ticker! (Newly registered member alert)
    const newNewsItem: NewsItem = {
      id: 'news-' + Date.now().toString(),
      type: 'welcome',
      content: `نرحب ترحيباً حاراً بانضمام العضو الجديد للشجرة المباركة: ${req.name} بن ${req.fatherName} بن ${req.grandfatherName} من بلد الإقامة ${req.country}!`,
      createdAt: new Date().toISOString()
    };
    setNews(prev => [newNewsItem, ...prev]);

    // If the currently simulated session is the one being approved, promote them immediately!
    if (currentSession.role === 'pending' && currentSession.requestId === requestId) {
      setCurrentSession({
        userId: newMemberId,
        name: `${req.name} بن ${req.fatherName} بن ${req.grandfatherName}`,
        email: req.email,
        role: 'member'
      });
      setActiveTab('profile');
    }
  };

  // Reject Request
  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    
    // If current simulated session is rejected, demote back to guest
    if (currentSession.role === 'pending' && currentSession.requestId === requestId) {
      handleLogout();
    }
  };

  // Member profile updates
  const handleUpdateMember = (updated: FamilyMember) => {
    // Check if the member was ALIVE, but now edited to DECEASED (Newly Deceased Condolence Announcement)
    const oldMember = members.find(m => m.id === updated.id);
    const wasAlive = oldMember ? oldMember.isAlive : true;
    
    setMembers(prev => {
      let next = prev.map(m => m.id === updated.id ? updated : m);
      
      // Auto-repair childrenIds based on fatherId or motherId for consistency
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
      return next;
    });

  };

  const handleUpdateMembers = (newMembers: FamilyMember[]) => {
    setMembers(prev => {
      let next = [...newMembers];
      
      // Auto-repair childrenIds based on fatherId or motherId for consistency
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
      return next;
    });
  };

  // Add Child (called by Member or Admin)
  const handleAddChild = (parentId: string, childInfo: Omit<FamilyMember, 'id' | 'fatherId' | 'childrenIds'>) => {
    const childId = 'member-' + Date.now().toString();
    const parent = members.find(m => m.id === parentId);
    
    // Helper to infer female gender from Arabic names
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

    setMembers(prev => {
      let updated = [...prev, newChild];
      // Append child ID to parent's node
      updated = updated.map(m => {
        if (m.id === parentId) {
          return {
            ...m,
            childrenIds: [...(m.childrenIds || []), childId]
          };
        }
        return m;
      });
      return updated;
    });

  };

  // Add Member Directly (Admin only)
  const handleAddMemberDirectly = (newMem: Omit<FamilyMember, 'id' | 'childrenIds'>): string => {
    const id = 'member-' + Date.now().toString();
    const member: FamilyMember = {
      ...newMem,
      id,
      childrenIds: []
    };

    setMembers(prev => {
      let updated = [...prev, member];
      // Link to father if supplied
      if (newMem.fatherId) {
        updated = updated.map(m => {
          if (m.id === newMem.fatherId) {
            return {
              ...m,
              childrenIds: [...(m.childrenIds || []), id]
            };
          }
          return m;
        });
      }
      // Link to mother if supplied
      if (newMem.motherId) {
        updated = updated.map(m => {
          if (m.id === newMem.motherId) {
            return {
              ...m,
              childrenIds: [...(m.childrenIds || []), id]
            };
          }
          return m;
        });
      }
      return updated;
    });
    return id;
  };

  // Delete Member (Admin only)
  const handleDeleteMember = (id: string) => {
    setMembers(prev => {
      // 1. Remove the node
      let filtered = prev.filter(m => m.id !== id);
      // 2. Remove reference from father's children list
      filtered = filtered.map(m => {
        if (m.childrenIds.includes(id)) {
          return {
            ...m,
            childrenIds: m.childrenIds.filter(cId => cId !== id)
          };
        }
        return m;
      });
      // 3. Set child fatherId to null for deleted father
      filtered = filtered.map(m => {
        if (m.fatherId === id) {
          return {
            ...m,
            fatherId: null
          };
        }
        return m;
      });
      return filtered;
    });
  };

  // Add general family news
  const handleAddNews = (newItem: Omit<NewsItem, 'id' | 'createdAt'>) => {
    const item: NewsItem = {
      ...newItem,
      id: 'news-' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNews(prev => [item, ...prev]);
  };

  const handleUpdateNews = (id: string, updatedFields: Partial<NewsItem>) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...updatedFields } : n));
  };

  const handleDeleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const handleAddPhoto = (newPhoto: Omit<FamilyPhoto, 'id'>) => {
    const photo: FamilyPhoto = {
      ...newPhoto,
      id: 'photo-' + Date.now().toString()
    };
    setPhotos(prev => [photo, ...prev]);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePhoto = (updatedPhoto: FamilyPhoto) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
  };

  const handleAddPhotoComment = (photoId: string, comment: Omit<MemberComment, 'id' | 'createdAt'>) => {
    const newComment: MemberComment = {
      ...comment,
      id: 'comment-' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPhotos(prev => prev.map(p => p.id === photoId ? {
      ...p,
      comments: [...(p.comments || []), newComment]
    } : p));
  };

  const handleDeletePhotoComment = (photoId: string, commentId: string) => {
    setPhotos(prev => prev.map(p => p.id === photoId ? {
      ...p,
      comments: (p.comments || []).filter(c => c.id !== commentId)
    } : p));
  };

  const handleSendMessage = (newMessage: Omit<FamilyMessage, 'id' | 'createdAt'>) => {
    const message: FamilyMessage = {
      ...newMessage,
      id: 'msg-' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [message, ...prev]);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const activeMember = members.find(m => m.id === currentSession.userId);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-12 text-right">
      
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
                تعديل ملفي الشخصي
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
              </button>
            )}
          </div>

          {/* Center Column: Header Title */}
          <div className="text-center py-1 md:py-0">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 font-serif tracking-wide">
              عائلة آل الوفائي والعطائي
            </h1>
          </div>

          {/* Left Column: User Profile Controls */}
          <div className="flex items-center justify-center md:justify-end gap-3">
            <button
              onClick={() => {
                if (currentSession.role === 'guest') {
                  setIsAuthOpen(true);
                } else if (currentSession.role === 'member') {
                  setActiveTab('profile');
                } else {
                  setActiveTab('admin');
                }
              }}
              className="relative group p-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/60 flex items-center justify-center bg-slate-50 text-slate-700 hover:text-indigo-600"
              title={currentSession.role !== 'guest' ? `الملف الشخصي: ${currentSession.name}` : "تسجيل الدخول / إنشاء حساب"}
            >
              <User size={18} />
              {currentSession.role !== 'guest' && (
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                  currentSession.role === 'admin' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />
              )}
            </button>

            {currentSession.role !== 'guest' && (
              <div className="hidden lg:block text-right">
                <span className="block text-[9px] text-slate-400 font-bold leading-none">مرحباً بك</span>
                <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] block">{currentSession.name}</span>
              </div>
            )}

            {currentSession.role !== 'guest' && (
              <button
                onClick={handleLogout}
                className="bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-2.5 rounded-full transition-colors border border-slate-200/50"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
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
              onUpdateInfo={setFamilyInfo}
              onGoToTree={(memberId?: string) => {
                if (memberId) setTreeSelectedMemberId(memberId);
                setActiveTab('tree');
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'tree' && (
            <FamilyTreeVisualizer
              members={members}
              initialSelectedMemberId={treeSelectedMemberId}
              onClearInitialSelection={() => setTreeSelectedMemberId(null)}
              isApprovedMember={currentSession.role === 'member' || currentSession.role === 'admin'}
              onOpenAuth={() => setIsAuthOpen(true)}
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
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onRegister={handleRegister}
        onLogin={handleLogin}
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
