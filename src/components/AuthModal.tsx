import React, { useState } from 'react';
import { RegistrationRequest, UserSession } from '../types';
import { X, User, Mail, Lock, Sparkles, MapPin, Award, BookOpen } from 'lucide-react';

const ARAB_COUNTRIES = [
  "أسبانيا", "استراليا", "الأردن", "الإمارات", "البحرين", "الجزائر", "الدنمارك", "السعودية", "السويد", "الصين", "العراق", "الكويت", "ألمانيا", "المغرب", "المملكة المتحدة", "النرويج", "الولايات المتحدة", "اليابان", "اليمن", "أمريكا الجنوبية", "تركيا", "تونس", "روسيا", "سلطنة عمان", "سوريا", "فرنسا", "فلسطين", "قطر", "كندا", "لبنان", "ليبيا", "ماليزيا", "مصر", "هولندا", "آخر"
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (request: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>) => void;
  onLogin: (email: string, role: 'admin' | 'member') => boolean;
}

export default function AuthModal({ isOpen, onClose, onRegister, onLogin }: AuthModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
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
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginEmail === 'admin@ghanem.family') {
      onLogin(loginEmail, 'admin');
      onClose();
    } else if (loginEmail.endsWith('@ghanem.family')) {
      // Allow simulated members (e.g., ahmed@ghanem.family)
      const success = onLogin(loginEmail, 'member');
      if (success) {
        onClose();
      } else {
        setLoginError('لم يتم العثور على عضو مسجل بهذا البريد الإلكتروني.');
      }
    } else {
      setLoginError('للتبسيط، استخدم البريد التجريبي في الأسفل أو سجل حساباً جديداً وسيوافق عليه الآدمن فوراً!');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fatherName || !grandfatherName || !email) return;

    onRegister({
      name,
      fatherName,
      grandfatherName,
      email,
      password,
      birthYear: birthYear === '' ? 0 : Number(birthYear),
      birthDate,
      country: country || 'غير محدد',
      specialization: specialization || 'غير محدد',
      bio: bio || 'عضو طموح في العائلة.',
      avatar: avatar || undefined,
      isAlive: true,
      gender
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      onClose();
    }, 4000);
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-right font-sans">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              {isRegisterMode ? 'تقديم طلب تسجيل في شجرة العائلة' : 'تسجيل الدخول لبوابتك العائلية'}
            </h3>
            <p className="text-slate-300 text-xs mt-1">
              {isRegisterMode ? 'سجل بياناتك وسيصل إشعار للآدمن للموافقة وربطك بالشجرة.' : 'أدخل بياناتك المعتمدة لإدارة وتحديث ملفك الشخصي.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-xl"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {regSuccess ? (
            <div className="text-center py-10 space-y-3">
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 p-4 rounded-2xl max-w-md mx-auto">
                <h4 className="font-extrabold text-base mb-1">تم إرسال طلب تسجيلك بنجاح! 🎉</h4>
                <p className="text-xs leading-relaxed">
                  لقد سجلنا اسمك الثلاثي: <strong className="font-bold">{name} بن {fatherName} بن {grandfatherName}</strong>. 
                  الطلب الآن معروض بانتظار موافقة الآدمن. يمكنك استخدام محاكي الأدوار في زاوية الشاشة لتتحول لـ "الآدمن" وتوافق على نفسك فوراً لتشاهد النتيجة!
                </p>
              </div>
            </div>
          ) : isRegisterMode ? (
            /* Register Mode */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">المعلومات الشخصية والنسب (إلزامي)</h4>
              
              {/* Core Naming Section (Strict Name, Father, Grandfather requirement) */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-indigo-700 block">تحديد خط النسب الأبوي الثلاثي:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اسمك الأول</label>
                    <input
                      type="text" required placeholder="الاسم الأول"
                      value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اسم والدك</label>
                    <input
                      type="text" required placeholder="اسم الأب"
                      value={fatherName} onChange={e => setFatherName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اسم جدك</label>
                    <input
                      type="text" required placeholder="اسم الجد"
                      value={grandfatherName} onChange={e => setGrandfatherName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 leading-normal">
                  * سيظهر اسمك في الشجرة بالصيغة: <strong className="font-semibold text-slate-700">{name || '___'} بن {fatherName || '___'} بن {grandfatherName || '___'} بن غانم</strong>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">البريد الإلكتروني</label>
                  <input
                    type="email" required placeholder="name@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">كلمة المرور</label>
                  <input
                    type="password" required placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Bio & Academic Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">تاريخ الميلاد</label>
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
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 cursor-pointer bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الجنس</label>
                  <select
                    value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">بلد الإقامة الحالي</label>
                  <select
                    value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="">( اختر )</option>
                    {ARAB_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">التخصص المهني/العلمي</label>
                  <input
                    type="text" required placeholder="التخصص المهني/العلمي"
                    value={specialization} onChange={e => setSpecialization(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">رابط صورة شخصية (اختياري)</label>
                <input
                  type="text" placeholder="رابط مباشر للصورة"
                  value={avatar} onChange={e => setAvatar(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">نبذة شخصية</label>
                <textarea
                  rows={2} required placeholder="اكتب نبذة تعريفية..."
                  value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm py-2.5 rounded-xl transition-all shadow-md"
              >
                تقديم طلب الانتساب للآدمن
              </button>
            </form>
          ) : (
            /* Login Mode */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl font-medium">
                  {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">البريد الإلكتروني للقرابة</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="example@ghanem.family"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">كلمة المرور</label>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm py-2.5 rounded-xl transition-all shadow-md"
              >
                تسجيل الدخول الآمن
              </button>

              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-[11px] text-slate-500 font-semibold mb-2">حسابات تجريبية سريعة بنقرة واحدة:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@ghanem.family');
                      setLoginPassword('admin123');
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] px-2 py-1 border border-red-200 rounded-lg transition-colors font-bold"
                  >
                    الآدمن (أبو غانم)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('ahmed@ghanem.family');
                      setLoginPassword('ahmed123');
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 border border-emerald-200 rounded-lg transition-colors font-bold"
                  >
                    عضو معتمد (أحمد بن محمد)
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs shrink-0">
          {isRegisterMode ? (
            <p className="text-slate-600">
              لديك حساب بالفعل؟{' '}
              <button onClick={() => setIsRegisterMode(false)} className="text-indigo-600 hover:underline font-bold">
                سجل دخولك من هنا
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              لست مسجلاً في الشجرة؟{' '}
              <button onClick={() => setIsRegisterMode(true)} className="text-indigo-600 hover:underline font-bold">
                قدم طلب انضمام الآن
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
