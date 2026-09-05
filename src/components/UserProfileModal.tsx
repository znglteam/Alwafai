import React from 'react';
import { UserSession, FamilyMember } from '../types';
import { User, Shield, Mail, CheckCircle, Clock, LogOut, ArrowRight, Sparkles, Network } from 'lucide-react';
import AvatarImage from './AvatarImage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  activeMember?: FamilyMember;
  onLogout: () => void;
  onGoToTree?: (memberId?: string) => void;
  onGoToProfileEdit?: () => void;
  onGoToAdmin?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentSession,
  activeMember,
  onLogout,
  onGoToTree,
  onGoToProfileEdit,
  onGoToAdmin
}: UserProfileModalProps) {
  if (!isOpen) return null;

  const isGuest = currentSession.role === 'guest';
  const isAdmin = currentSession.role === 'admin';
  const isMember = currentSession.role === 'member';
  const isPending = currentSession.role === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans dir-rtl animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className={`p-6 text-white text-center relative ${
          isAdmin 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-800' 
            : isMember 
              ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800'
              : isPending
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-slate-600 to-slate-800'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all cursor-pointer"
          >
            ✕
          </button>

          {/* Avatar / Icon */}
          <div className="mx-auto mb-3 w-20 h-20 rounded-full bg-white/10 p-1 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg relative overflow-hidden">
            {activeMember?.avatar ? (
              <AvatarImage
                src={activeMember.avatar}
                alt={currentSession.name}
                avatarScale={activeMember.avatarScale || 1}
                avatarX={activeMember.avatarX || 0}
                avatarY={activeMember.avatarY || 0}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white">
                {isAdmin ? <Shield size={32} /> : <User size={32} />}
              </div>
            )}
          </div>

          <h3 className="text-lg font-extrabold">{currentSession.name}</h3>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
            {isAdmin && <Shield size={12} className="text-emerald-300" />}
            {isMember && <CheckCircle size={12} className="text-indigo-200" />}
            {isPending && <Clock size={12} className="text-amber-200" />}
            <span>
              {isAdmin ? 'مدير عام البوابة (Admin)' : isMember ? 'عضو معتمد بالشجرة' : isPending ? 'طلب تسجيل قيد المراجعة' : 'زائر'}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 overflow-y-auto text-right text-slate-700 text-xs md:text-sm">
          
          {/* Account Details Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <Mail size={14} className="text-indigo-500" />
                البريد الإلكتروني:
              </span>
              <span className="font-semibold text-slate-800 dir-ltr">{currentSession.email || 'غير مسجل'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <Shield size={14} className="text-indigo-500" />
                نوع الصلاحية:
              </span>
              <span className="font-bold text-slate-800">
                {isAdmin ? 'تحكم كامل بالنظام' : isMember ? 'تعديل السلالة المباشرة' : isPending ? 'بانتظار موافقة الآدمن' : 'تصفح'}
              </span>
            </div>

            {activeMember && (
              <>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-bold">بلد الإقامة:</span>
                  <span className="font-semibold text-slate-800">{activeMember.country || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">التخصص / المهنة:</span>
                  <span className="font-semibold text-slate-800">{activeMember.specialization || 'غير محدد'}</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {isMember && activeMember && onGoToProfileEdit && (
              <button
                onClick={() => {
                  onClose();
                  onGoToProfileEdit();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <User size={15} />
                <span>تعديل بياناتي وأبنائي في الشجرة</span>
              </button>
            )}

            {isMember && activeMember && onGoToTree && (
              <button
                onClick={() => {
                  onClose();
                  onGoToTree(activeMember.id);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Network size={15} />
                <span>عرض موقعي في شجرة العائلة</span>
              </button>
            )}

            {isAdmin && onGoToAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onGoToAdmin();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Shield size={15} />
                <span>الانتقال إلى لوحة إدارة البوابة</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={15} />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
