import React, { useState, useEffect } from 'react';
import { RegistrationRequest } from '../types';
import { isMemberFemale } from '../utils/marriageUtils';
import { PWAInstallButton } from "./PWAInstallButton";
import { X, User, Mail, Lock, Sparkles, LogIn, UserPlus, Upload, FileText, CheckCircle, Plus, Trash2, Users, HelpCircle, Info } from 'lucide-react';

const ARAB_COUNTRIES = [
  "أسبانيا", "استراليا", "الأردن", "الإمارات", "البحرين", "الجزائر", "الدنمارك", "السعودية", "السويد", "الصين", "العراق", "الكويت", "ألمانيا", "المغرب", "المملكة المتحدة", "النرويج", "الولايات المتحدة", "اليابان", "اليمن", "أمريكا الجنوبية", "تركيا", "تونس", "روسيا", "سلطنة عمان", "سوريا", "فرنسا", "فلسطين", "قطر", "كندا", "لبنان", "ليبيا", "ماليزيا", "مصر", "هولندا", "آخر"
];

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onRegister: (request: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; message?: string }> | void;
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
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setLoginError('');
      setRegSuccess(false);
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!name.trim() || !fatherName.trim() || !grandfatherName.trim() || !email.trim()) return;

    try {
      const result = await onRegister({
        name: name.trim(),
        fatherName: fatherName.trim(),
        grandfatherName: grandfatherName.trim(),
        email: email.trim().toLowerCase(),
        password: password || '',
        birthYear: 0,
        birthDate: '',
        country: 'غير محدد',
        specialization: 'غير محدد',
        bio: 'عضو في العائلة.',
        avatar: '',
        isAlive: true,
        siblings: [],
        unclesAndAunts: []
      });

      if (result && result.success === false) {
        setLoginError(result.message || 'حدث خطأ أثناء إرسال الطلب.');
        return;
      }

      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        onClose();
      }, 15000);
    } catch (err) {
      setLoginError('نعتذر، لقد نفدت سعة بيانات الموقع المخصصة لهذا اليوم. يرجى إعادة المحاولة غداً بعد الساعة 11:00 صباحاً بتوقيت مكة المكرمة.');
    }
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
                  <strong className="font-bold text-emerald-900 text-sm">{name} {isMemberFemale({ name }) ? 'بنت' : 'بن'} {fatherName} بن {grandfatherName}</strong>
                </p>
                <div className="pt-4 border-t border-emerald-200/60 mt-4">
                  <PWAInstallButton />
                </div>
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
                    {name.trim() || '...'} {isMemberFemale({ name }) ? 'بنت' : 'بن'} {fatherName.trim() || '...'} بن {grandfatherName.trim() || '...'}
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
