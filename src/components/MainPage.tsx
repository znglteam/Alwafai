import React, { useState } from 'react';
import { FamilyInfo, FamilyPhoto, FamilyMember, MemberComment, UserSession } from '../types';
import { Image, History, Calendar, Award, MapPin, Users, Plus, Trash2, TrendingUp, BookOpen, Network, LogIn, ChevronDown, Activity, Globe, Upload, MessageSquare, Pencil, X } from 'lucide-react';
import { motion } from 'motion/react';

interface MainPageProps {
  familyInfo: FamilyInfo;
  photos: FamilyPhoto[];
  members: FamilyMember[];
  isAdmin: boolean;
  isGuest: boolean;
  currentSession: UserSession;
  onAddPhoto: (photo: Omit<FamilyPhoto, 'id'>) => void;
  onDeletePhoto: (id: string) => void;
  onUpdatePhoto: (photo: FamilyPhoto) => void;
  onAddPhotoComment: (photoId: string, comment: Omit<MemberComment, 'id' | 'createdAt'>) => void;
  onDeletePhotoComment: (photoId: string, commentId: string) => void;
  onUpdateInfo: (info: FamilyInfo) => void;
  onGoToTree: (memberId?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenRegister?: () => void;
}

export default function MainPage({
  familyInfo,
  photos,
  members,
  isAdmin,
  isGuest,
  currentSession,
  onAddPhoto,
  onDeletePhoto,
  onUpdatePhoto,
  onAddPhotoComment,
  onDeletePhotoComment,
  onUpdateInfo,
  onGoToTree,
  onOpenAuth,
  onOpenRegister
}: MainPageProps) {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<FamilyInfo>({ ...familyInfo });
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  
  // New Photo Form State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');

  // Edit Photo State
  const [editingPhoto, setEditingPhoto] = useState<FamilyPhoto | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editPhotoCaption, setEditPhotoCaption] = useState('');
  const [editPhotoDate, setEditPhotoDate] = useState('');
  const [editPhotoDescription, setEditPhotoDescription] = useState('');

  // Photo Comments UI State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [activeComments, setActiveComments] = useState<Record<string, string>>({});
  const [guestNames, setGuestNames] = useState<Record<string, string>>({});


  // Statistics calculations
  const totalCount = members.length;
  const aliveCount = members.filter(m => m.isAlive).length;
  const deceasedCount = totalCount - aliveCount;

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  const getFullName = (m: FamilyMember) => {
    const father = m.fatherId ? members.find(f => f.id === m.fatherId) : null;
    const grandfather = father?.fatherId ? members.find(g => g.id === father.fatherId) : null;
    const resolvedFather = (father?.name || m.fatherName || '').trim();
    const resolvedGrandfather = ((grandfather?.name || father?.fatherName || m.grandfatherName) || '').trim();
    return [m.name, resolvedFather, resolvedGrandfather].filter(Boolean).join(' ');
  };

  const countryStats = members.reduce((acc, member) => {
    const c = member.country || 'غير محدد';
    if (!acc[c]) acc[c] = [];
    acc[c].push({ id: member.id, name: getFullName(member) });
    return acc;
  }, {} as Record<string, {id: string, name: string}[]>);

  const specStats = members.reduce((acc, member) => {
    const s = member.specialization || 'غير محدد';
    if (!acc[s]) acc[s] = [];
    acc[s].push({ id: member.id, name: getFullName(member) });
    return acc;
  }, {} as Record<string, {id: string, name: string}[]>);

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
    .slice(0, 3);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInfo(infoForm);
    setIsEditingInfo(false);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;
    
    // Fallback default Unsplash photo if simple text is entered, to look nice
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

  const handleStartEditPhoto = (photo: FamilyPhoto) => {
    setEditingPhoto(photo);
    setEditPhotoUrl(photo.url);
    setEditPhotoCaption(photo.caption);
    setEditPhotoDate(photo.date);
    setEditPhotoDescription(photo.description || '');
  };

  const handleEditPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    
    let finalUrl = editPhotoUrl;
    if (!editPhotoUrl.startsWith('http') && !editPhotoUrl.startsWith('data:')) {
      finalUrl = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800';
    }

    onUpdatePhoto({
      ...editingPhoto,
      url: finalUrl,
      caption: editPhotoCaption,
      date: editPhotoDate || new Date().toISOString().split('T')[0],
      description: editPhotoDescription || undefined
    });

    setEditingPhoto(null);
    setEditPhotoUrl('');
    setEditPhotoCaption('');
    setEditPhotoDate('');
    setEditPhotoDescription('');
  };

  return (
    <div id="main-page-container" className="pt-0 pb-6 space-y-4 dir-rtl text-right">
      
      {/* Top Family Showcase: Logo & Bio/History directly underneath */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 md:p-6 shadow-xs space-y-2 max-w-4xl mx-auto">
        
        {/* Family Logo Centered (Enlarged and raised to the very top) */}
        <div className="flex flex-col items-center justify-center text-center -mt-2 pb-0">
          <img 
            src="/family_logo.png" 
            alt="شعار آل الوفائي والعطائي" 
            className="w-72 h-72 sm:w-84 sm:h-84 md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] max-h-[500px] object-contain hover:scale-102 transition-transform duration-300 drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Biography & History directly under the Logo (Raised higher with minimal gap) */}
        <div className="space-y-2.5 -mt-3 pt-2 border-t border-slate-100/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-lg md:text-xl font-bold text-[#414141] flex items-center gap-2">
              <History className="text-amber-600" size={20} />
              عن العائلة ونشأتها
            </h3>
            {isAdmin && !isEditingInfo && (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition-all font-semibold cursor-pointer"
              >
                تعديل النبذة والتاريخ
              </button>
            )}
          </div>

          {isEditingInfo ? (
            <form onSubmit={handleSaveInfo} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم العائلة</label>
                <input
                  type="text"
                  required
                  value={infoForm.familyName}
                  onChange={e => setInfoForm({ ...infoForm, familyName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نبذة قصيرة</label>
                <textarea
                  rows={3}
                  required
                  value={infoForm.bio}
                  onChange={e => setInfoForm({ ...infoForm, bio: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ العائلة وجذورها</label>
                <textarea
                  rows={5}
                  required
                  value={infoForm.history}
                  onChange={e => setInfoForm({ ...infoForm, history: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setInfoForm({ ...familyInfo });
                    setIsEditingInfo(false);
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-1">
              <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                {familyInfo.bio}
              </p>
              <div className="border-t border-dashed border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">التفاصيل التاريخية والجغرافية</h4>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {familyInfo.history}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Section */}

      <section id="gallery-section" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Image className="text-indigo-600" size={22} />
              أعلام العائلة وكبارها
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              معرض الصور التذكارية لأعيان ولقاءات واجتماعات العائلة المباركة
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowAddPhoto(!showAddPhoto)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 self-start shadow-sm"
            >
              <Plus size={16} />
              {showAddPhoto ? 'إغلاق النموذج' : 'إضافة صورة جديدة للألبوم'}
            </button>
          )}
        </div>

        {/* Add Photo Form (Collapsible, Admin only) */}
        {isAdmin && showAddPhoto && (
          <form onSubmit={handlePhotoSubmit} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700">إضافة صورة جديدة للألبوم العائلي</h4>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">صورة الألبوم (تحميل من الجهاز)</label>
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
                      <span className="block text-[10px] text-slate-400">تدعم ملفات الصور (PNG, JPG, JPEG)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">وصف مختصر أو عنوان الصورة *</label>
              <input
                type="text"
                required
                placeholder="مثال: صورة جماعية من اللقاء العائلي في المدينة المنورة"
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">النص المرافق أو قصة الصورة</label>
              <textarea
                placeholder="اكتب هنا تفاصيل إضافية، أسماء الأشخاص الظاهرين في الصورة، أو قصة هذه المناسبة العائلية..."
                value={photoDescription}
                onChange={e => setPhotoDescription(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddPhoto(false)}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold"
              >
                تثبيت وإضافة الصورة
              </button>
            </div>
          </form>
        )}

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start justify-items-center">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="group bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative w-fit max-w-full flex flex-col justify-self-center"
            >
              {/* Photo Container - matches the exact size of the image */}
              <div className="relative w-fit max-w-full mx-auto overflow-hidden flex items-center justify-center">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-auto h-auto max-h-[460px] max-w-full object-contain block group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Image Overlay for Delete & Edit */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={() => handleStartEditPhoto(photo)}
                      className="bg-indigo-600/90 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg backdrop-blur-xs"
                      title="تعديل الصورة والبيانات"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="bg-rose-600/90 text-white p-2 rounded-xl hover:bg-rose-700 transition-colors shadow-lg backdrop-blur-xs"
                      title="حذف الصورة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Caption & Description */}
              <div className="p-4 space-y-2 max-w-sm">
                <p className="text-slate-800 text-xs md:text-sm font-bold leading-relaxed">
                  {photo.caption}
                </p>
                {photo.description && (
                  <p className="text-slate-500 text-[11px] md:text-xs leading-relaxed whitespace-pre-line border-t border-slate-100 pt-2 font-medium">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3 max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-slate-400" />
                    التعليقات
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Comments List */}
                  <div className="space-y-2 pr-1">
                    {(photo.comments && photo.comments.length > 0) ? (
                      photo.comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-2.5 rounded-xl border border-slate-100 relative group/comment text-[11px]">
                          <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                            <span>{comment.senderName}</span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {new Date(comment.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">{comment.content}</p>
                          
                          {/* Delete button if Admin */}
                          {isAdmin && (
                            <button
                              onClick={() => onDeletePhotoComment(photo.id, comment.id)}
                              className="absolute top-2 left-2 text-rose-500 hover:text-rose-700 p-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                              title="حذف التعليق"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[10px] text-slate-400 py-2">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const commentText = activeComments[photo.id] || '';
                      if (!commentText.trim()) return;
                      
                      const senderName = isGuest ? (guestNames[photo.id] || 'زائر عابر') : currentSession.name;
                      onAddPhotoComment(photo.id, {
                        senderName,
                        senderEmail: currentSession.email || 'guest@family.com',
                        content: commentText
                      });
                      
                      setActiveComments(prev => ({ ...prev, [photo.id]: '' }));
                      if (isGuest) {
                        setGuestNames(prev => ({ ...prev, [photo.id]: '' }));
                      }
                    }}
                    className="space-y-2 pt-2 border-t border-slate-100"
                  >
                    {isGuest && (
                      <input
                        type="text"
                        placeholder="اسمك الكريم"
                        required
                        value={guestNames[photo.id] || ''}
                        onChange={(e) => setGuestNames(prev => ({ ...prev, [photo.id]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    )}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="اكتب تعليقك هنا..."
                        value={activeComments[photo.id] || ''}
                        onChange={(e) => setActiveComments(prev => ({ ...prev, [photo.id]: e.target.value }))}
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors shrink-0"
                      >
                        إرسال
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {photos.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Image className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-sm font-medium">لم يتم رفع أي صور عائلية بعد.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Pencil size={16} className="text-indigo-600" />
                تعديل الصورة العائلية
              </h3>
              <button 
                onClick={() => setEditingPhoto(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleEditPhotoSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
              {/* Image upload / Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">تغيير الصورة (تحميل من الجهاز أو اتركها كما هي)</label>
                <div className="relative flex items-center justify-center border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-white p-3 cursor-pointer h-[130px] transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setEditPhotoUrl(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  {editPhotoUrl ? (
                    <div className="flex items-center gap-4 w-full h-full z-0">
                      <img src={editPhotoUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-slate-100 shadow-sm" />
                      <div className="text-right space-y-0.5">
                        <span className="block text-xs font-bold text-indigo-600">تم اختيار صورة جديدة</span>
                        <span className="block text-[10px] text-slate-400 font-medium">انقر أو اسحب لتغييرها مجدداً</span>
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

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">وصف مختصر أو عنوان الصورة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صورة جماعية من اللقاء العائلي في المدينة المنورة"
                  value={editPhotoCaption}
                  onChange={e => setEditPhotoCaption(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">النص المرافق أو قصة الصورة</label>
                <textarea
                  placeholder="اكتب هنا تفاصيل إضافية، أسماء الأشخاص الظاهرين في الصورة، أو قصة هذه المناسبة العائلية..."
                  value={editPhotoDescription}
                  onChange={e => setEditPhotoDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
