import { useState } from 'react';
import { UserSession, UserRole } from '../types';
import { Shield, User, Eye, Hourglass, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface RoleSimulatorProps {
  currentSession: UserSession;
  onChangeSession: (session: UserSession) => void;
  pendingCount: number;
}

export default function RoleSimulator({ currentSession, onChangeSession, pendingCount }: RoleSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'admin',
      label: 'مدير النظام (آدمن)',
      icon: Shield,
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      desc: 'لديه الصلاحية للموافقة على الأعضاء الجدد، إضافة وتعديل الأخبار، تعديل الشجرة بالكامل وإضافة الصور.'
    },
    {
      role: 'member',
      label: 'عضو مسجل (أحمد الوفائي)',
      icon: User,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      desc: 'عضو معتمد يستطيع تعديل ملفه الشخصي ومعلوماته فقط. أما الإضافة والتعديل على الشجرة فهما في يد الآدمن فقط.'
    },
    {
      role: 'pending',
      label: 'مقدم طلب جديد',
      icon: Hourglass,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      desc: 'سجل حسابه وينتظر موافقة الآدمن. لا يمكنه تعديل الملف حتى يوافق عليه الآدمن من لوحة الإدارة.'
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    if (role === 'admin') {
      onChangeSession({
        userId: 'admin-id',
        name: 'مدير البوابة (الآدمن)',
        email: 'admin@family.com',
        role: 'admin'
      });
    } else if (role === 'member') {
      onChangeSession({
        userId: 'member-1-2', // "أحمد"
        name: 'أحمد بن محمد الوفائي',
        email: 'ahmed@alwafaey.com',
        role: 'member'
      });
    } else if (role === 'pending') {
      onChangeSession({
        userId: 'pending-temp-id',
        name: 'سليمان بن فيصل العطائي',
        email: 'solaiman@alataey.com',
        role: 'pending',
        requestId: 'req-pending-1'
      });
    } else {
      onChangeSession({
        userId: null,
        name: 'زائر العائلة',
        email: '',
        role: 'guest'
      });
    }
  };

  return (
    <div id="role-simulator" className="fixed bottom-4 left-4 z-50 max-w-sm font-sans transition-all duration-300">
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 dir-rtl text-right">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle size={16} className="text-indigo-600" />
                محاكي الأدوار للتجربة السريعة
              </h4>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              title="إخفاء"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            بما أن قاعدة البيانات محلية، يمكنك الانتقال بين الأدوار لتجربة دورة التسجيل والموافقة والتعديل كاملة:
          </p>

          <div className="space-y-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentSession.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleSelectRole(r.role)}
                  className={`w-full text-right p-2 border rounded-xl text-xs transition-all flex flex-col gap-1 ${r.color} ${
                    isActive ? 'ring-2 ring-indigo-600 font-bold scale-[1.01] shadow-sm' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5">
                      <Icon size={14} />
                      {r.label}
                    </span>
                    {isActive && (
                      <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                        نشط الآن
                      </span>
                    )}
                    {r.role === 'admin' && pendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 rounded-full animate-bounce">
                        {pendingCount} طلب معلق
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal leading-normal">
                    {r.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 bg-slate-50 rounded-xl p-2 border border-slate-100 text-[11px] text-slate-600 leading-normal">
            <span className="font-bold block text-slate-700 mb-0.5">الحساب النشط حالياً:</span>
            {currentSession.name} ({currentSession.role === 'admin' ? 'مدير' : currentSession.role === 'member' ? 'عضو' : currentSession.role === 'pending' ? 'معلق' : 'زائر'})
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white border border-indigo-500 shadow-xl rounded-full p-3 flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-105"
          title="افتح محاكي الأدوار لتجربة النظام"
        >
          <HelpCircle size={22} className="animate-pulse" />
        </button>
      )}
    </div>
  );
}
