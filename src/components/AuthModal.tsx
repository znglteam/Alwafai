import React, { useState, useEffect } from 'react';
import { RegistrationRequest } from '../types';
import { X, User, Mail, Lock, Sparkles, LogIn, UserPlus, Upload, FileText, CheckCircle, Plus, Trash2, Users, HelpCircle, Info } from 'lucide-react';

const ARAB_COUNTRIES = [
  "أسبانيا", "استراليا", "الأردن", "الإمارات", "البحرين", "الجزائر", "الدنمارك", "السعودية", "السويد", "الصين", "العراق", "الكويت", "ألمانيا", "المغرب", "المملكة المتحدة", "النرويج", "الولايات المتحدة", "اليابان", "اليمن", "أمريكا الجنوبية", "تركيا", "تونس", "روسيا", "سلطنة عمان", "سوريا", "فرنسا", "فلسطين", "قطر", "كندا", "لبنان", "ليبيا", "ماليزيا", "مصر", "هولندا", "آخر"
];

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onRegister: (request: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => void;
  onLogin: (email: string, password?: string) => { success: boolean; message?: string };
}

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onRegister, onLogin }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialMode);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Fields
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [grandfatherName, setGrandfatherName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [siblings, setSiblings] = useState<string[]>([]);
  const [unclesAndAunts, setUnclesAndAunts] = useState<string[]>([]);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setLoginError('');
      setRegSuccess(false);
      if (initialMode === 'register') {
        setSiblings([]);
        setUnclesAndAunts([]);
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    const result = onLogin(loginEmail.trim(), loginPassword.trim());
    if (result.success) {
      onClose();
    } else {
      setLoginError(result.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fatherName.trim() || !grandfatherName.trim() || !email.trim()) return;

    const cleanedSiblings = siblings.map(s => s.trim()).filter(Boolean);
    const cleanedUnclesAndAunts = unclesAndAunts.map(u => u.trim()).filter(Boolean);

    onRegister({
      name: name.trim(),
      fatherName: fatherName.trim(),
      grandfatherName: grandfatherName.trim(),
      email: email.trim().toLowerCase(),
      password: password || '',
      birthYear: birthYear === '' ? 0 : Number(birthYear),
      birthDate: birthDate || '',
      country: country.trim() || 'غير محدد',
      specialization: specialization.trim() || 'غير محدد',
      bio: bio.trim() || 'عضو في العائلة.',
      avatar: avatar.trim() || '',
      isAlive: true,
      gender: gender || 'male',
      siblings: cleanedSiblings,
      unclesAndAunts: cleanedUnclesAndAunts
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      onClose();
    }, 4000);
  };

  const isRegisterMode = currentMode === 'register';

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-right font-sans">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Visual Distinctions between Login & Register */}
        <div className={`${isRegisterMode ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900' : 'bg-gradient-to-r from-slate-900 to-slate-800'} text-white p-5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isRegisterMode ? 'bg-indigo-600/60 text-amber-300' : 'bg-slate-700 text-indigo-400'}`}>
              {isRegisterMode ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                {isRegisterMode ? 'طلب تسجيل حساب جديد في الشجرة' : 'تسجيل الدخول إلى البوابة'}
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                {isRegisterMode ? 'أدخل اسمك ونسبك الثلاثي للربط بالشجرة بعد اعتماد الآدمن.' : 'أدخل بريدك الإلكتروني وكلمة المرور المسجلة مسبقاً.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {regSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-6 rounded-3xl max-w-md mx-auto space-y-3">
                <CheckCircle className="mx-auto text-emerald-600" size={44} />
                <h4 className="font-extrabold text-base">تم إرسال طلب انضمامك بنجاح!</h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  تم تسجيل طلبك بالاسم الثلاثي: <br />
                  <strong className="font-bold text-emerald-900 text-sm">{name} بن {fatherName} بن {grandfatherName}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  الطلب الآن معروض في لوحة إدارة العائلة لمطابقته وربطه بالوالد المناسب في الشجرة.
                </p>
              </div>
            </div>
          ) : isRegisterMode ? (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-indigo-900 block flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  بيانات خط النسب (الاسم الثلاثي):
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسمك الأول *</label>
                    <input
                      type="text" required placeholder="الاسم الأول"
                      value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم والدك *</label>
                    <input
                      type="text" required placeholder="اسم الأب"
                      value={fatherName} onChange={e => setFatherName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم جدك *</label>
                    <input
                      type="text" required placeholder="اسم الجد"
                      value={grandfatherName} onChange={e => setGrandfatherName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                </div>

                <div className="bg-white/80 border border-indigo-100/80 rounded-xl p-2.5 text-xs text-slate-600">
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">معاينة الاسم في الشجرة:</span>
                  <strong className="text-indigo-950 font-bold">
                    {name.trim() || '...'} بن {fatherName.trim() || '...'} بن {grandfatherName.trim() || '...'}
                  </strong>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">البريد الإلكتروني *</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="email" required placeholder="name@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pr-8 pl-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور للحساب *</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="password" required placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pr-8 pl-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => {
                      const dateVal = e.target.value;
                      setBirthDate(dateVal);
                      if (dateVal) {
                        const yr = new Date(dateVal).getFullYear();
                        setBirthYear(yr);
                      } else {
                        setBirthYear('');
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الجنس</label>
                  <select
                    value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">بلد الإقامة</label>
                  <select
                    value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="">بلد الإقامة...</option>
                    {ARAB_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">التخصص المهني</label>
                  <input
                    type="text" placeholder="التخصص أو المهنة"
                    value={specialization} onChange={e => setSpecialization(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              {/* Helpful Note for Lineage & Acceptance */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 block">ملاحظة: كلما أضفت معلومات أكثر كلما ساعد هذا على قبول طلبك</span>
                  <span className="text-[11px] text-amber-800/90 block">
                    إضافة أسماء الإخوة والأعمام والعمات يساعد مسؤولي الشجرة في التعرف على فرعك ونسبك بدقة وسرعة اعتماد حسابك.
                  </span>
                </div>
              </div>

              {/* Siblings Multiple Inputs */}
              <div className="bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" />
                    <span>أسماء الإخوة والأخوات</span>
                    <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSiblings([...siblings, ''])}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all border border-indigo-100 cursor-pointer active:scale-95"
                  >
                    <Plus size={12} />
                    <span>إضافة أخ/أخت</span>
                  </button>
                </div>

                {siblings.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-1">
                    لم يتم تسجيل أسماء بعد. اضغط <span className="font-bold text-indigo-600">"إضافة أخ/أخت"</span> لإضافة خانة جديدة.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                    {siblings.map((sib, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                        <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={sib}
                          onChange={e => {
                            const updated = [...siblings];
                            updated[index] = e.target.value;
                            setSiblings(updated);
                          }}
                          placeholder={`اسم الأخ أو الأخت (${index + 1})`}
                          className="flex-1 text-xs border-0 focus:ring-0 focus:outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setSiblings(siblings.filter((_, i) => i !== index))}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="حذف هذا الاسم"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paternal Uncles & Aunts Multiple Inputs */}
              <div className="bg-slate-50/70 border border-slate-200/80 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-600" />
                    <span>أسماء الأعمام والعمات</span>
                    <span className="text-[10px] text-slate-400 font-normal">(إخوان وأخوات الأب - اختياري)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUnclesAndAunts([...unclesAndAunts, ''])}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all border border-indigo-100 cursor-pointer active:scale-95"
                  >
                    <Plus size={12} />
                    <span>إضافة عم/عمة</span>
                  </button>
                </div>

                {unclesAndAunts.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-1">
                    لم يتم تسجيل أسماء بعد. اضغط <span className="font-bold text-indigo-600">"إضافة عم/عمة"</span> لإضافة خانة جديدة.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                    {unclesAndAunts.map((uncle, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                        <span className="w-5 h-5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={uncle}
                          onChange={e => {
                            const updated = [...unclesAndAunts];
                            updated[index] = e.target.value;
                            setUnclesAndAunts(updated);
                          }}
                          placeholder={`اسم العم أو العمة (${index + 1})`}
                          className="flex-1 text-xs border-0 focus:ring-0 focus:outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setUnclesAndAunts(unclesAndAunts.filter((_, i) => i !== index))}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="حذف هذا الاسم"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">صورة الملف الشخصي</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setAvatar(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
                  />
                  {avatar && (
                    <img src={avatar} alt="معاينة" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نبذة تعريفية</label>
                <textarea
                  rows={2} placeholder="اكتب نبذة مختصرة عن نفسك، دراستك، أو اهتماماتك..."
                  value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={16} />
                تقديم طلب الانضمام للشجرة
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              {loginError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl font-medium">
                  {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">البريد الإلكتروني المسجل *</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">كلمة المرور *</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#414141] hover:bg-[#333333] text-white font-bold text-xs md:text-sm py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn size={16} />
                تسجيل الدخول
              </button>
            </form>
          )}
        </div>

        {/* Footer Mode Switcher */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs shrink-0">
          {isRegisterMode ? (
            <p className="text-slate-600">
              لديك حساب معتمد بالفعل؟{' '}
              <button 
                type="button"
                onClick={() => {
                  setCurrentMode('login');
                  setLoginError('');
                }} 
                className="text-indigo-600 hover:text-indigo-800 font-bold underline mr-1"
              >
                تسجيل الدخول هنا
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              لست مسجلاً في الشجرة بعد؟{' '}
              <button 
                type="button"
                onClick={() => {
                  setCurrentMode('register');
                  setLoginError('');
                }} 
                className="text-indigo-600 hover:text-indigo-800 font-bold underline mr-1"
              >
                تقديم طلب تسجيل حساب جديد
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
