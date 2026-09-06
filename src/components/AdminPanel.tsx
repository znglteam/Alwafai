import React, { useState } from 'react';
import { FamilyMember, RegistrationRequest, NewsItem, FamilyPhoto, FamilyMessage, MemberComment, UserSession } from '../types';
import { LiveChangeLog } from '../utils/firebaseService';

const ARAB_COUNTRIES = [
  "أسبانيا", "استراليا", "الأردن", "الإمارات", "البحرين", "الجزائر", "الدنمارك", "السعودية", "السويد", "الصين", "العراق", "الكويت", "ألمانيا", "المغرب", "المملكة المتحدة", "النرويج", "الولايات المتحدة", "اليابان", "اليمن", "أمريكا الجنوبية", "تركيا", "تونس", "روسيا", "سلطنة عمان", "سوريا", "فرنسا", "فلسطين", "قطر", "كندا", "لبنان", "ليبيا", "ماليزيا", "مصر", "هولندا", "آخر"
];
import { Shield, Users, User, Check, X, Plus, Trash2, Edit2, Bell, Sparkles, UserPlus, Heart, Volume2, Image, MessageSquare, Calendar, Download, MapPin, BookOpen, TrendingUp, Mars, Venus, Upload, Activity, History } from 'lucide-react';
import { GenderUserIcon } from './GenderIcon';
import AvatarImage from './AvatarImage';

interface AdminPanelProps {
  requests: RegistrationRequest[];
  members: FamilyMember[];
  news: NewsItem[];
  photos: FamilyPhoto[];
  messages: FamilyMessage[];
  currentSession: UserSession;
  auditLogs?: LiveChangeLog[];
  onApproveRequest: (requestId: string, fatherId: string | null) => void;
  onRejectRequest: (requestId: string) => void;
  onAddNews: (newsItem: Omit<NewsItem, 'id' | 'createdAt'>) => void;
  onUpdateNews: (id: string, updatedFields: Partial<NewsItem>) => void;
  onDeleteNews: (id: string) => void;
  onDeleteMember: (id: string) => void;
  onAddMemberDirectly: (member: Omit<FamilyMember, 'id' | 'childrenIds'>) => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onAddPhoto: (photo: Omit<FamilyPhoto, 'id'>) => void;
  onDeletePhoto: (id: string) => void;
  onAddPhotoComment: (photoId: string, comment: Omit<MemberComment, 'id' | 'createdAt'>) => void;
  onDeletePhotoComment: (photoId: string, commentId: string) => void;
  onDeleteMessage: (id: string) => void;
  onRestoreMembers?: (members: FamilyMember[]) => void;
}

export default function AdminPanel({
  requests,
  members,
  news,
  photos,
  messages,
  currentSession,
  auditLogs = [],
  onApproveRequest,
  onRejectRequest,
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  onDeleteMember,
  onAddMemberDirectly,
  onUpdateMember,
  onAddPhoto,
  onDeletePhoto,
  onAddPhotoComment,
  onDeletePhotoComment,
  onDeleteMessage,
  onRestoreMembers
}: AdminPanelProps) {
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'tree' | 'news' | 'photos' | 'messages' | 'stats' | 'logs'>('requests');

  // Photo Comments UI State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [activeComments, setActiveComments] = useState<Record<string, string>>({});

  // Helper to determine female gender: explicit gender takes precedence
  const isMemberFemale = (member?: { gender?: string; name?: string } | null): boolean => {
    if (!member) return false;
    if (member.gender === 'female') return true;
    if (member.gender === 'male') return false;
    if (!member.name) return false;
    const femaleNames = ['فاطمة', 'سارة', 'هند', 'سعاد', 'منى', 'ريم', 'حصة', 'نورة', 'أميرة', 'عائشة', 'فاطمه', 'ساره', 'مريم', 'زينب', 'خديجة', 'رندة', 'ليلى', 'رنا', 'رانية', 'هالة', 'سهى'];
    const firstWord = member.name.trim().split(' ')[0];
    return femaleNames.includes(firstWord);
  };

  // Statistics calculations
  const totalCount = members.length;
  const aliveCount = members.filter(m => m.isAlive).length;
  const deceasedCount = totalCount - aliveCount;

  // Country counts
  const countryCounts = members.reduce((acc, m) => {
    if (m.isAlive && m.country) {
      acc[m.country] = (acc[m.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Specialization counts
  const specializationCounts = members.reduce((acc, m) => {
    if (m.specialization && !m.specialization.includes('المرحلة')) {
      const cleanSpec = m.specialization.split('(')[0].trim();
      acc[cleanSpec] = (acc[cleanSpec] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Top specializations sorted
  const topSpecializations = Object.entries(specializationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // News Form state
  const [newsType, setNewsType] = useState<NewsItem['type']>('general');
  const [newsContent, setNewsContent] = useState('');
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const handleEditNewsClick = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsContent(item.content);
    setNewsType(item.type);
  };

  const handleCancelEditNews = () => {
    setEditingNewsId(null);
    setNewsContent('');
    setNewsType('general');
  };

  // Photo Form State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Approve request linkage state
  const [requestFatherLinks, setRequestFatherLinks] = useState<Record<string, string>>({});
  const [fatherSearchQueries, setFatherSearchQueries] = useState<Record<string, string>>({});

  // Direct Member Form state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemFatherName, setNewMemFatherName] = useState('');
  const [newMemGrandName, setNewMemGrandName] = useState('');
  const [newMemBirth, setNewMemBirth] = useState<number | ''>('');
  const [newMemCountry, setNewMemCountry] = useState('');
  const [newMemSpecialization, setNewMemSpecialization] = useState('');
  const [newMemIsAlive, setNewMemIsAlive] = useState(true);
  const [newMemDeath, setNewMemDeath] = useState<number>(2020);
  const [newMemBio, setNewMemBio] = useState('');
  const [newMemAvatar, setNewMemAvatar] = useState('');
  const [newMemSpouse, setNewMemSpouse] = useState('');
  const [newMemSpouseId, setNewMemSpouseId] = useState<string | null>(null);
  const [newMemMaritalStatus, setNewMemMaritalStatus] = useState<"أعزب" | "مرتبط" | "متزوج" | "منفصل/ أرمل" | "( اختر )" | "">("");
  const [newMemFatherId, setNewMemFatherId] = useState<string>('');
  const [newMemGender, setNewMemGender] = useState<'male' | 'female'>('male');

  // Member editing state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FamilyMember | null>(null);

  // Request filters
  const [requestFilter, setRequestFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const pendingRequests = requests.filter(r => !r.status || r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const displayedRequests = requests.filter(r => {
    if (requestFilter === 'pending') return !r.status || r.status === 'pending';
    if (requestFilter === 'approved') return r.status === 'approved';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

  const handlePostNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsContent.trim()) return;
    
    if (editingNewsId) {
      onUpdateNews(editingNewsId, {
        type: newsType,
        content: newsContent
      });
      setEditingNewsId(null);
    } else {
      onAddNews({
        type: newsType,
        content: newsContent
      });
    }
    setNewsContent('');
    setNewsType('general');
  };

  const handlePostPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    let finalUrl = photoUrl;
    if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
      finalUrl = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800';
    }

    onAddPhoto({
      url: finalUrl,
      caption: photoCaption || 'صورة عائلية',
      date: photoDate || new Date().toISOString().split('T')[0],
      description: photoDescription || undefined
    });

    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoDate('');
    setPhotoDescription('');
    setShowAddPhoto(false);
  };

  const handleCreateMemberDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemFatherName) return;

    onAddMemberDirectly({
      name: newMemName,
      fatherName: newMemFatherName,
      grandfatherName: newMemGrandName,
      birthYear: newMemBirth === '' ? 0 : Number(newMemBirth),
      country: newMemIsAlive ? (newMemCountry || 'غير محدد') : '',
      specialization: newMemSpecialization || 'غير محدد',
      isAlive: newMemIsAlive,
      deathYear: newMemIsAlive ? null : newMemDeath,
      bio: newMemBio || `فرد من أفراد العائلة الكرام.`,
      avatar: newMemAvatar || undefined,
      maritalStatus: newMemMaritalStatus,
      spouseName: newMemMaritalStatus === "متزوج" ? (newMemSpouse || null) : null,
      spouseId: newMemMaritalStatus === "متزوج" ? (newMemSpouseId || null) : null,
      fatherId: newMemFatherId || null,
      gender: newMemGender
    });

    // Reset Form
    setNewMemName('');
    setNewMemFatherName('');
    setNewMemGrandName('');
    setNewMemBirth('');
    setNewMemCountry('');
    setNewMemSpecialization('');
    setNewMemIsAlive(true);
    setNewMemBio('');
    setNewMemAvatar('');
    setNewMemSpouse('');
    setNewMemSpouseId(null);
    setNewMemMaritalStatus('');
    setNewMemFatherId('');
    setNewMemGender('male');
    setShowAddMember(false);
  };

  const handleStartEdit = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setEditForm({ ...member });
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      const updatedForm = {
        ...editForm,
        country: editForm.isAlive ? editForm.country : ''
      };
      onUpdateMember(updatedForm);
      setEditingMemberId(null);
      setEditForm(null);
    }
  };

  return (
    <div id="admin-panel-container" className="py-2 space-y-8 dir-rtl text-right">
      
      {/* Title */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4 border border-indigo-700/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">لوحة تحكم مدير العائلة</h2>
            <p className="text-xs text-indigo-100 mt-1">
              مرحباً يا مدير بوابة شجرة العائلة. هنا تعتمد الطلبات، وتعدل جذور وأغصان الشجرة، وتنشر الأخبار والتعازي والتبريكات.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          طلبات الانتساب والتسجيل ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('tree')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'tree' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          هيكلة وإدارة أفراد الشجرة ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'news' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          إدارة شريط أخبار العائلة
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'photos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ألبوم الصور ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'messages' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الرسائل والمرفقات ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'stats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          إحصائيات العائلة
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'logs' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity size={14} className="text-amber-500" />
          <span>سجل التغييرات الحي ({auditLogs.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div>
        
        {/* Tab 1: Registration Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus size={20} className="text-amber-500" />
                  طلبات الانتساب والتسجيل الجديدة
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تصل هنا جميع طلبات الانضمام المقدمة من أبناء وبنات العائلة لفحصها واعتماد ربطها بالوالد الصحيح في الشجرة.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setRequestFilter('pending')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    requestFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  قيد الانتظار ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('approved')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    requestFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  المعتمدة ({approvedRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('rejected')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    requestFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  المرفوضة ({rejectedRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('all')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    requestFilter === 'all'
                      ? 'bg-[#414141] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({requests.length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {displayedRequests.map(req => {
                const linkedFatherId = requestFatherLinks[req.id] || '';
                const isPending = !req.status || req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm hover:border-indigo-100 transition-colors">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                              معلق بانتظار قرارك
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Check size={12} />
                              معتمد ومضاف للشجرة
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">
                              طلب مرفوض
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {req.gender === 'female' ? 'أنثى' : 'ذكر'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-base">
                          {req.name} بن {req.fatherName} بن {req.grandfatherName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          البريد الإلكتروني: <strong className="text-slate-800 font-mono">{req.email}</strong> {req.createdAt ? `| سُجّل في: ${new Date(req.createdAt).toLocaleDateString('ar-SA')}` : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => onRejectRequest(req.id)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <X size={14} />
                              رفض الطلب
                            </button>
                            <button
                              onClick={() => onApproveRequest(req.id, linkedFatherId || null)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 font-bold shadow-md shadow-emerald-600/10 cursor-pointer"
                            >
                              <Check size={14} />
                              اعتماد وقبول الحساب
                            </button>
                          </>
                        )}
                        {isRejected && (
                          <button
                            onClick={() => onApproveRequest(req.id, linkedFatherId || null)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Check size={14} />
                            إعادة الاعتماد والقبول
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta Detail Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-0.5">سنة الميلاد</span>
                        <span className="font-semibold text-slate-800">{req.birthYear ? `${req.birthYear}م` : "-"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-0.5">بلد الإقامة</span>
                        <span className="font-semibold text-slate-800">{req.country || "-"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-0.5">التخصص المهني/العلمي</span>
                        <span className="font-semibold text-slate-800">{req.specialization || "-"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold mb-0.5">الحالة</span>
                        <span className="font-semibold text-slate-800">{req.isAlive ? 'حي يرزق' : 'متوفى'}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {req.bio && (
                      <div className="bg-white border border-slate-200/60 p-3 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        <span className="block text-[9px] text-slate-400 font-bold mb-1">نبذة شخصية:</span>
                        {req.bio}
                      </div>
                    )}

                    {/* Linking connection to tree */}
                    {isPending && (() => {
                      const searchQuery = (fatherSearchQueries[req.id] || '').trim().toLowerCase();
                      const candidateMembers = members
                        .filter(m => {
                          if (!searchQuery) return true;
                          const fullName = `${m.name} ${m.fatherName || ''} ${m.grandfatherName || ''}`.toLowerCase();
                          return fullName.includes(searchQuery);
                        })
                        .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

                      const selectedMember = members.find(m => m.id === linkedFatherId);

                      return (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="block text-xs font-extrabold text-amber-900">
                              ربط نسب العضو بالوالد المناسب في شجرة العائلة:
                            </label>
                            <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full font-medium self-start sm:self-auto">
                              إجمالي أفراد الشجرة: {members.length} فرد
                            </span>
                          </div>

                          {/* Quick Live Search Box */}
                          <div className="relative">
                            <input
                              type="text"
                              value={fatherSearchQueries[req.id] || ''}
                              onChange={e => setFatherSearchQueries({ ...fatherSearchQueries, [req.id]: e.target.value })}
                              placeholder="🔍 ابحث بالاسم لتصفية قائمة الآباء في الشجرة..."
                              className="w-full bg-white border border-amber-300/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                            />
                            {fatherSearchQueries[req.id] && (
                              <button
                                type="button"
                                onClick={() => setFatherSearchQueries({ ...fatherSearchQueries, [req.id]: '' })}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded"
                              >
                                مسح
                              </button>
                            )}
                          </div>

                          {/* Members Dropdown */}
                          <select
                            value={linkedFatherId}
                            onChange={e => setRequestFatherLinks({ ...requestFatherLinks, [req.id]: e.target.value })}
                            className="w-full border border-amber-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer text-slate-800 font-medium shadow-sm"
                          >
                            <option value="">-- تركه كفرد مستقل بدون والد (أو تعيينه لاحقاً) --</option>
                            {candidateMembers.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} {m.fatherName ? `بن ${m.fatherName}` : ''} {m.grandfatherName ? `بن ${m.grandfatherName}` : ''} {m.birthYear ? `(مواليد ${m.birthYear}م)` : ''}
                              </option>
                            ))}
                          </select>

                          {/* Active Selection or Guidance */}
                          {selectedMember ? (
                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                              <Check size={14} className="text-emerald-600 shrink-0" />
                              <span>
                                تم اختيار الوالد: <strong>{selectedMember.name} بن {selectedMember.fatherName || ''} بن {selectedMember.grandfatherName || ''}</strong> (سيضاف العضو كفرع تحت هذا الأب مباشرة).
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 leading-normal">
                              💡 إذا لم تجد والد العضو في الشجرة بعد، يمكنك اعتماد الطلب كفرد مستقل، أو إضافة والده أولاً من تبويب <strong>"أفراد الشجرة"</strong> ثم ربطه.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}

              {displayedRequests.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Check className="mx-auto text-emerald-500 bg-emerald-50 rounded-full p-2 mb-2" size={44} />
                  <p className="text-sm font-semibold text-slate-700">لا توجد طلبات في هذا القسم حالياً.</p>
                  <p className="text-xs text-slate-400 mt-1">جميع طلبات الانضمام المعروضة تم التعامل معها.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Hierarchy & Direct Members */}
        {activeTab === 'tree' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users size={20} className="text-indigo-600" />
                  قائمة أفراد العائلة والتعديل الفوري
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تعديل أي فرد من أفراد العائلة مباشرة، أو حذفه، أو إنشاء أفرع جديدة كمدير للنظام بالكامل.
                </p>
              </div>

              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 self-start"
              >
                <Plus size={16} />
                إضافة فرد يدوياً للشجرة
              </button>
            </div>

            {/* Direct Member Addition Form (Collapsible) */}
            {showAddMember && (
              <form onSubmit={handleCreateMemberDirectly} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-1">إضافة فرد للشجرة بشكل مباشر من لوحة الإدارة</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الأول للفرد *</label>
                    <input
                      type="text" required placeholder="الاسم الأول"
                      value={newMemName} onChange={e => setNewMemName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">اسم الأب *</label>
                    <input
                      type="text" required placeholder="اسم الأب"
                      value={newMemFatherName} onChange={e => setNewMemFatherName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">اسم الجد *</label>
                    <input
                      type="text" required placeholder="اسم الجد"
                      value={newMemGrandName} onChange={e => setNewMemGrandName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">سنة الميلاد</label>
                    <input
                      type="number"
                      value={newMemBirth} onChange={e => setNewMemBirth(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="سنة الميلاد"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  {newMemIsAlive && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">بلد الإقامة</label>
                      <select
                        value={newMemCountry} onChange={e => setNewMemCountry(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                      >
                        <option value="">بلد الإقامة...</option>
                        {ARAB_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">التخصص المهني/العلمي</label>
                    <input
                      type="text" placeholder="التخصص المهني/العلمي"
                      value={newMemSpecialization} onChange={e => setNewMemSpecialization(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة الاجتماعية</label>
                    <select
                      value={newMemMaritalStatus} onChange={e => setNewMemMaritalStatus(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="">( اختر )</option>
                      <option value="أعزب">أعزب</option>
                      <option value="مرتبط">مرتبط</option>
                      <option value="متزوج">متزوج</option>
                      <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                    </select>
                  </div>
                  {newMemMaritalStatus === 'متزوج' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 mb-0.5">
                        {newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                      </label>
                      <div className="flex items-center gap-2 mb-1.5">
                        <input 
                          type="checkbox" 
                          id="admin-new-same-family-spouse"
                          checked={newMemSpouseId !== undefined && newMemSpouseId !== null} 
                          onChange={e => {
                            if(e.target.checked) { setNewMemSpouseId(''); setNewMemSpouse('');
    setNewMemSpouseId(null); }
                            else { setNewMemSpouseId(null); setNewMemSpouse('');
    setNewMemSpouseId(null); }
                          }} 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="admin-new-same-family-spouse" className="text-[10px] text-slate-600 font-bold cursor-pointer">من نفس العائلة؟</label>
                      </div>
                      {newMemSpouseId !== null && newMemSpouseId !== undefined ? (
                        <select 
                          value={newMemSpouseId || ''} 
                          onChange={e => {
                              const selectedSpouse = members.find(m => m.id === e.target.value);
                              setNewMemSpouseId(e.target.value);
                              setNewMemSpouse(selectedSpouse?.name || '');
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                        >
                            <option value="" disabled>اختر {newMemGender === 'female' ? 'الزوج' : 'الزوجة'}</option>
                            {members.filter(m => m.gender !== newMemGender).map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.gender === 'female' ? 'بنت' : 'بن'} {m.fatherName})</option>
                            ))}
                        </select>
                      ) : (
                        <input
                          type="text" placeholder={newMemGender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                          value={newMemSpouse} onChange={e => setNewMemSpouse(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                        />
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">صورة شخصية من جهازك</label>
                    <input
                      type="file" accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setNewMemAvatar(e.target?.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setNewMemAvatar('');
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة</label>
                    <select
                      value={newMemIsAlive ? 'alive' : 'deceased'}
                      onChange={e => setNewMemIsAlive(e.target.value === 'alive')}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="alive">على قيد الحياة</option>
                      <option value="deceased">متوفى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الجنس</label>
                    <select
                      value={newMemGender}
                      onChange={e => setNewMemGender(e.target.value as 'male' | 'female')}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>

                  {!newMemIsAlive && (
                    <div className="md:col-span-3 bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <label className="block text-xs font-bold text-rose-700 mb-1">سنة الوفاة</label>
                      <input
                        type="number" required
                        value={newMemDeath} onChange={e => setNewMemDeath(parseInt(e.target.value) || 2020)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  )}

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">ربط نسبه بالأب في الشجرة (هام جداً)</label>
                    <select
                      value={newMemFatherId}
                      onChange={e => setNewMemFatherId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer text-slate-700"
                    >
                      <option value="">-- تركه كعميد مستقل في قمة الشجرة (بدون والد) --</option>
                      {members.filter(m => !isMemberFemale(m)).map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} بن {m.fatherName} بن {m.grandfatherName} (ولد عام {m.birthYear ? `${m.birthYear}م` : "-"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نبذة شخصية</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب نبذة وسيرة لهذا الفرد..."
                    value={newMemBio} onChange={e => setNewMemBio(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                  />
                </div>

                <div className="flex justify-start gap-2 pt-1">
                  <button
                    type="submit"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="text-xs bg-slate-200 text-slate-700 px-3 py-2 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* Editing Existing Member Form */}
            {editingMemberId && editForm && (
              <form onSubmit={handleSaveMemberEdit} className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-amber-800 border-b border-amber-200 pb-1">أنت تقوم بتعديل بيانات الفرد: {editForm.name} بن {editForm.fatherName}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الأول</label>
                    <input
                      type="text" required
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">اسم الأب</label>
                    <input
                      type="text" required
                      value={editForm.fatherName}
                      onChange={e => setEditForm({ ...editForm, fatherName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      disabled={!!editForm.fatherId}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">اسم الجد</label>
                    <input
                      type="text" required
                      value={editForm.grandfatherName}
                      onChange={e => setEditForm({ ...editForm, grandfatherName: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      disabled={!!editForm.fatherId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">سنة الميلاد</label>
                    <input
                      type="number"
                      value={editForm.birthYear === 0 ? '' : editForm.birthYear}
                      onChange={e => setEditForm({ ...editForm, birthYear: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="سنة الميلاد"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  {editForm.isAlive && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">بلد الإقامة</label>
                      <select
                        value={editForm.country || ''}
                        onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                      >
                        <option value="">بلد الإقامة...</option>
                        {ARAB_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">التخصص المهني/العلمي</label>
                    <input
                      type="text" required
                      value={editForm.specialization}
                      onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة الاجتماعية</label>
                    <select
                      value={editForm.maritalStatus || ''}
                      onChange={e => setEditForm({ ...editForm, maritalStatus: e.target.value as any, spouseName: e.target.value === 'متزوج' ? editForm.spouseName : null })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="">( اختر )</option>
                      <option value="أعزب">أعزب</option>
                      <option value="مرتبط">مرتبط</option>
                      <option value="متزوج">متزوج</option>
                      <option value="منفصل/ أرمل">منفصل/ أرمل</option>
                    </select>
                  </div>
                  {editForm.maritalStatus === 'متزوج' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 mb-0.5">
                        {editForm.gender === 'female' ? 'اسم الزوج' : 'اسم الزوجة'}
                      </label>
                      <div className="flex items-center gap-2 mb-1.5">
                        <input 
                          type="checkbox" 
                          id="admin-edit-same-family-spouse"
                          checked={editForm.spouseId !== undefined && editForm.spouseId !== null} 
                          onChange={e => {
                            if(e.target.checked) setEditForm({...editForm, spouseId: '', spouseName: null})
                            else setEditForm({...editForm, spouseId: null, spouseName: null})
                          }} 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="admin-edit-same-family-spouse" className="text-[10px] text-slate-600 font-bold cursor-pointer">من نفس العائلة؟</label>
                      </div>
                      {editForm.spouseId !== null && editForm.spouseId !== undefined ? (
                        <select 
                          value={editForm.spouseId || ''} 
                          onChange={e => {
                              const selectedSpouse = members.find(m => m.id === e.target.value);
                              setEditForm({ ...editForm, spouseId: e.target.value, spouseName: selectedSpouse?.name || null });
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                        >
                            <option value="" disabled>اختر {editForm.gender === 'female' ? 'الزوج' : 'الزوجة'}</option>
                            {members.filter(m => m.gender !== editForm.gender && m.id !== editForm.id).map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.gender === 'female' ? 'بنت' : 'بن'} {m.fatherName})</option>
                            ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editForm.spouseName || ''}
                          onChange={e => setEditForm({ ...editForm, spouseName: e.target.value || null })}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                        />
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الحالة</label>
                    <select
                      value={editForm.isAlive ? 'alive' : 'deceased'}
                      onChange={e => setEditForm({ ...editForm, isAlive: e.target.value === 'alive' })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="alive">على قيد الحياة</option>
                      <option value="deceased">متوفى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">الجنس</label>
                    <select
                      value={editForm.gender || 'male'}
                      onChange={e => setEditForm({ ...editForm, gender: e.target.value as 'male' | 'female' })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white cursor-pointer"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>

                  {!editForm.isAlive && (
                    <div className="md:col-span-3 bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <label className="block text-xs font-bold text-rose-700 mb-1">سنة الوفاة</label>
                      <input
                        type="number" required
                        value={editForm.deathYear || 0}
                        onChange={e => setEditForm({ ...editForm, deathYear: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نبذة شخصية</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white"
                  />
                </div>

                <div className="flex justify-start gap-2">
                  <button
                    type="submit"
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMemberId(null);
                      setEditForm(null);
                    }}
                    className="text-xs bg-slate-200 text-slate-700 px-3 py-2 rounded-xl"
                  >
                    إلغاء التعديل
                  </button>
                </div>
              </form>
            )}

            {/* Table or list of members */}
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 relative flex items-center justify-center text-slate-500 border border-slate-200">
                      {m.avatar ? (
                        <AvatarImage 
                          src={m.avatar} 
                          alt={m.name} 
                          avatarX={m.avatarX}
                          avatarY={m.avatarY}
                          avatarScale={m.avatarScale}
                        />
                      ) : (
                        <GenderUserIcon gender={isMemberFemale(m) ? 'female' : 'male'} size={28} className="stroke-[1.5]" isAlive={m.isAlive} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {m.name} بن {m.fatherName} بن {m.grandfatherName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        سنة الميلاد: {m.birthYear ? `${m.birthYear}م` : "-"} | الإقامة: {m.country} | التخصص: {m.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(m)}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold"
                    >
                      <Edit2 size={12} />
                      تعديل
                    </button>
                    {m.id !== ' patriarch' && (
                      <button
                        onClick={() => setMemberToDelete(m.id)}
                        className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: News Feed Management */}
        {activeTab === 'news' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-indigo-600" />
                إدارة الأخبار والجريدة الإخبارية لعائلة آل الوفائي والعطائي
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                انشر ترحيباً حاراً بالأعضاء، تهنئة للمواليد الجدد، أو تعازي للمتوفين الجدد (يظهر في شريط الأخبار المتحرك بالأعلى).
              </p>
            </div>

            {/* Add/Edit News Form */}
            <form onSubmit={handlePostNews} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-700">
                {editingNewsId ? 'تعديل الخبر أو التهنئة المحددة' : 'نشر خبر أو تهنئة جديدة'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">نوع الخبر</label>
                  <select
                    value={newsType}
                    onChange={e => setNewsType(e.target.value as NewsItem['type'])}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="general">تنويه عام / تنبيه</option>
                    <option value="welcome">ترحيب بعضو جديد</option>
                    <option value="baby">تهنئة بمولود جديد</option>
                    <option value="condolence">تعزية ومواساة</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 mb-1">محتوى الخبر بالكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: يسر عائلة آل الوفائي والعطائي تهنئة المهندس خالد بمناسبة ترقيته..."
                    value={newsContent}
                    onChange={e => setNewsContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingNewsId && (
                  <button
                    type="button"
                    onClick={handleCancelEditNews}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    إلغاء التعديل
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  {editingNewsId ? <Edit2 size={14} /> : <Plus size={14} />}
                  {editingNewsId ? 'حفظ التعديلات' : 'نشر وإظهار في الشريط الإخباري'}
                </button>
              </div>
            </form>

            {/* News List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">أرشيف الأخبار المنشورة حالياً</h4>
              {news.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border ${
                      item.type === 'welcome' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      item.type === 'baby' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                      item.type === 'condolence' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {item.type === 'welcome' ? 'ترحيب' : item.type === 'baby' ? 'تهنئة' : item.type === 'condolence' ? 'تعزية' : 'تنويه'}
                    </span>
                    <p className="text-xs md:text-sm font-medium text-slate-700 leading-normal">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditNewsClick(item)}
                      className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-slate-200/60 rounded-xl transition-all"
                      title="تعديل الإعلان"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteNews(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-200/60 rounded-xl transition-all"
                      title="حذف الإعلان"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 4: Photos Management */}
        {activeTab === 'photos' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Image size={20} className="text-[#71a874]" />
                  إدارة ألبوم صور العائلة والاجتماعات
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  إضافة صور جديدة ليتصفحها جميع زوار وأفراد العائلة في الصفحة الرئيسية، أو حذف الصور القديمة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPhoto(!showAddPhoto)}
                className="bg-[#414141] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 self-start"
              >
                <Plus size={16} />
                {showAddPhoto ? 'إغلاق نموذج الإضافة' : 'إضافة صورة جديدة'}
              </button>
            </div>

            {/* Add Photo Form */}
            {showAddPhoto && (
              <form onSubmit={handlePostPhoto} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-700">إضافة صورة جديدة للألبوم</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">صورة الألبوم (تحميل من الجهاز)</label>
                    <div className="relative flex items-center justify-center border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-white p-3 cursor-pointer h-[120px] transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        required={!photoUrl}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setPhotoUrl(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      {photoUrl ? (
                        <div className="flex items-center gap-3 w-full h-full z-0">
                          <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                          <div className="text-right">
                            <span className="block text-xs font-bold text-emerald-600">تم اختيار الصورة بنجاح</span>
                            <span className="block text-[10px] text-slate-400">انقر أو اسحب لتغييرها</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 text-center z-0">
                          <Upload size={24} className="text-slate-400 stroke-[1.5]" />
                          <div className="space-y-0.5">
                            <span className="block text-xs font-bold text-slate-600">اسحب الصورة هنا أو تصفح جهازك</span>
                            <span className="block text-[10px] text-slate-400">PNG, JPG, JPEG</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">وصف الصورة / المناسبة *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: الاجتماع السنوي لعام 2026"
                        value={photoCaption}
                        onChange={e => setPhotoCaption(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">النص المرافق أو قصة الصورة</label>
                  <textarea
                    placeholder="اكتب هنا تفاصيل إضافية، أسماء الأشخاص الظاهرين، أو قصة هذه المناسبة العائلية..."
                    value={photoDescription}
                    onChange={e => setPhotoDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>

                {/* Preset sample buttons to test additions quickly */}
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-400 font-bold">روابط صور جاهزة لتجربة سريعة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800');
                        setPhotoCaption('الشباب المتفوقين في الحفل السنوي');
                        setPhotoDescription('صورة تجمع المتميزين من أبناء وبنات العائلة الذين حصلوا على مراتب الشرف العلمي لهذا العام، وتم تكريمهم في حفل بهيج.');
                      }}
                      className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-100/50 transition-colors"
                    >
                      عينة 1: تكريم المتفوقين
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800');
                        setPhotoCaption('مجلس عائلة غانم المبارك');
                        setPhotoDescription('صورة تذكارية من اجتماع الجمعية العمومية الدوري واللقاء الأخوي الذي عُقد لمناقشة أوقاف العائلة والمشاريع المستقبلية للشباب.');
                      }}
                      className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-100/50 transition-colors"
                    >
                      عينة 2: مجلس العائلة
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-[#414141] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    نشر الصورة في المعرض الرئيسي
                  </button>
                </div>
              </form>
            )}

            {/* Photos List */}
            {photos.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
                <Image className="mx-auto text-slate-300 animate-pulse" size={40} />
                <h4 className="text-xs font-bold text-slate-500">لا توجد صور حالياً في الألبوم العائلي</h4>
                <p className="text-[10px] text-slate-400">انقر على زر "إضافة صورة جديدة" بالأعلى لإضافة صورة فوراً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="border border-slate-100 bg-slate-50/40 rounded-2xl overflow-hidden shadow-xs flex flex-col group">
                    <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-all group-hover:scale-105"
                      />
                      <button
                        onClick={() => onDeletePhoto(photo.id)}
                        className="absolute top-2 left-2 bg-white/90 hover:bg-rose-600 text-slate-600 hover:text-white p-2 rounded-xl transition-all shadow-md"
                        title="حذف الصورة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-relaxed">{photo.caption}</p>
                        {photo.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-1">{photo.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Admin Comments Section */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} className="text-slate-400" />
                          التعليقات
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {/* Comments List with deletion */}
                        <div className="space-y-1.5 pr-1">
                          {(photo.comments && photo.comments.length > 0) ? (
                            photo.comments.map((comment) => (
                              <div key={comment.id} className="bg-white p-2 rounded-lg border border-slate-100 relative group/comment text-[10px]">
                                <div className="flex items-center justify-between font-bold text-slate-700 mb-0.5">
                                  <span>{comment.senderName}</span>
                                  <span className="text-[8px] text-slate-400 font-normal">
                                    {new Date(comment.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium pl-6">{comment.content}</p>
                                
                                {/* Delete button (Always shown for admin) */}
                                <button
                                  onClick={() => onDeletePhotoComment(photo.id, comment.id)}
                                  className="absolute top-1.5 left-1.5 text-rose-500 hover:text-rose-700 p-0.5"
                                  title="حذف التعليق"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-[9px] text-slate-400 py-2">لا توجد تعليقات.</p>
                          )}
                        </div>

                        {/* Admin Quick Add Comment Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const commentText = activeComments[photo.id] || '';
                            if (!commentText.trim()) return;
                            
                            onAddPhotoComment(photo.id, {
                              senderName: currentSession.name,
                              senderEmail: currentSession.email,
                              content: commentText
                            });
                            
                            setActiveComments(prev => ({ ...prev, [photo.id]: '' }));
                          }}
                          className="flex gap-1 pt-1.5 border-t border-slate-100"
                        >
                          <input
                            type="text"
                            required
                            placeholder="أضف تعليقاً بصفتك آدمن..."
                            value={activeComments[photo.id] || ''}
                            onChange={(e) => setActiveComments(prev => ({ ...prev, [photo.id]: e.target.value }))}
                            className="flex-1 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors shrink-0"
                          >
                            إرسال
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Messages Inbox */}
        {activeTab === 'messages' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#71a874]" />
                بريد رسائل ومرفقات أفراد العائلة
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تصفح واقرأ الرسائل الواردة من أعضاء العائلة، مع إمكانية عرض واعتماد الصور والفيديوهات المرفقة وتثبيتها في ثوانٍ.
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                <MessageSquare className="mx-auto text-slate-300" size={44} />
                <h4 className="text-xs font-bold text-slate-500">صندوق الرسائل فارغ حالياً</h4>
                <p className="text-[10px] text-slate-400">عندما يقوم الأعضاء بمراسلتك من صفحة "مراسلة الإدارة" ستظهر جميع رسائلهم ومرفقاتهم هنا.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="border border-slate-100 hover:border-indigo-100 bg-slate-50/20 hover:bg-slate-50/50 p-5 rounded-2xl transition-all flex flex-col md:flex-row gap-5">
                    
                    {/* Message Body Column */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                            المرسل: {msg.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400 mr-2" dir="ltr">{msg.senderEmail}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>

                      <h4 className="font-bold text-xs md:text-sm text-[#414141]">{msg.subject}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{msg.content}</p>

                      {/* Attachment controls */}
                      {msg.attachmentType === 'image' && msg.attachmentUrl && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onAddPhoto({
                                url: msg.attachmentUrl || '',
                                caption: `${msg.subject} (مرسلة من ${msg.senderName})`,
                                date: new Date().toISOString().split('T')[0]
                              });
                              alert('تمت إضافة الصورة المرفقة إلى المعرض الرئيسي بنجاح! يمكنك الآن تصفحها هناك.');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Plus size={12} />
                            اعتماد وإضافة الصورة المرفقة للألبوم العائلي مباشرة
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Attachment preview panel */}
                    {msg.attachmentType !== 'none' && msg.attachmentUrl && (
                      <div className="w-full md:w-56 shrink-0 border border-slate-200/60 rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center justify-center p-2 space-y-2">
                        <span className="text-[9px] font-bold text-slate-400">الملف المرفق: {msg.attachmentType === 'image' ? 'صورة' : 'فيديو'}</span>
                        
                        {msg.attachmentType === 'image' ? (
                          <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute bottom-1 right-1 bg-white/90 hover:bg-white text-[#414141] text-[9px] px-2 py-0.5 rounded font-bold shadow flex items-center gap-0.5"
                            >
                              <Download size={8} />
                              عرض كامل
                            </a>
                          </div>
                        ) : (
                          <div className="w-full">
                            <video
                              src={msg.attachmentUrl}
                              controls
                              className="w-full h-28 rounded-lg object-contain bg-black"
                            />
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-center text-[9px] font-bold text-indigo-600 hover:underline mt-1"
                            >
                              فتح الرابط المباشر للمقطع
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delete option */}
                    <div className="md:self-start flex md:flex-col justify-end">
                      <button
                        onClick={() => onDeleteMessage(msg.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                        title="حذف الرسالة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Statistics (Admins only) */}
        {activeTab === 'stats' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                إحصائيات وتوزيع أفراد العائلة
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تقرير شامل وحصري لإدارة البوابة يعرض التحليلات الجغرافية والتخصصية والبيانات الديموغرافية لأفراد العائلة المسجلين بالشجرة.
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-right">
                <span className="block text-xs text-indigo-600 font-bold mb-1">إجمالي الأعضاء بالشجرة</span>
                <span className="text-3xl font-extrabold text-indigo-900">{totalCount} <span className="text-sm font-normal text-indigo-700">فرد</span></span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-right">
                <span className="block text-xs text-emerald-600 font-bold mb-1">الأعضاء الأحياء</span>
                <span className="text-3xl font-extrabold text-emerald-900">{aliveCount} <span className="text-sm font-normal text-emerald-700">فرد</span></span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-right">
                <span className="block text-xs text-slate-500 font-bold mb-1">الأعضاء المتوفين</span>
                <span className="text-3xl font-extrabold text-slate-800">{deceasedCount} <span className="text-sm font-normal text-slate-600">فرد</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Geographical Distribution */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <MapPin size={16} className="text-indigo-600" />
                  توزيع الإقامة للأعضاء الأحياء
                </h4>
                <div className="space-y-3">
                  {Object.entries(countryCounts).length > 0 ? (
                    Object.entries(countryCounts).map(([country, count]) => {
                      const percentage = Math.round((count / aliveCount) * 100) || 0;
                      return (
                        <div key={country} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">{country}</span>
                            <span className="text-slate-600">{count} فرد ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">لا توجد بيانات إقامة متوفرة.</p>
                  )}
                </div>
              </div>

              {/* Distinguished Specializations */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200/60 pb-2">
                  <BookOpen size={16} className="text-indigo-600" />
                  أبرز التخصصات العلمية والمهنية بالشجرة
                </h4>
                <div className="space-y-2">
                  {topSpecializations.length > 0 ? (
                    topSpecializations.map(([spec, count]) => (
                      <div key={spec} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[240px]">{spec}</span>
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg shrink-0">
                          {count} {count > 1 ? 'أعضاء' : 'عضو'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">لا توجد تخصصات علمية مدونة بعد.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 7: Real-time Live Change Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <History size={20} className="text-amber-600" />
                  سجل التغييرات والتعديلات الحية
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تتبع فوري ومباشر لجميع التغييرات التي يجريها الأعضاء والمسؤولون على شجرة العائلة وبياناتها السحابية.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-xl border border-emerald-200/60 font-bold self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>المزامنة السحابية متصلة ونشطة</span>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Activity size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">لا توجد عمليات مسجلة حتى الآن</p>
                <p className="text-xs text-slate-400">أي تعديل يجريه أي فرد أو الآدمن على الشجرة سيظهر هنا فوراً بلحظتها.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                          {log.userName}
                        </span>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          {log.action}
                        </span>
                        {log.targetMemberName && (
                          <span className="text-xs text-slate-600 font-medium">
                            على: <strong className="text-indigo-600">{log.targetMemberName}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {log.details}
                        {log.userPhone && ` • هاتف: ${log.userPhone}`}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>


      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600">هل أنت متأكد تماماً من رغبتك في حذف الفرد وأي تفرعات متصلة به؟ لا يمكن التراجع.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">إلغاء</button>
              <button onClick={() => { onDeleteMember(memberToDelete); setMemberToDelete(null); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors">نعم، احذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

