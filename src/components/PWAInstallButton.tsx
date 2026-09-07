import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle, X, Sparkles, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'prominent' | 'compact' | 'banner' | 'header';
  className?: string;
  label?: string;
  sublabel?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'prominent',
  className = '',
  label,
  sublabel,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running inside standalone app
  if (isInstalled) {
    if (variant === 'compact' || variant === 'header') {
      return null;
    }
    return (
      <div className={`flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 ${className}`}>
        <CheckCircle size={16} className="text-emerald-600" />
        <span>التطبيق مثبت على جهازك بنجاح</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const defaultLabel = label || 'تثبيت أيقونة الموقع في سطح المكتب';

  return (
    <>
      {variant === 'banner' ? (
        <div className={`bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 dir-rtl text-right ${className}`}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-amber-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <Monitor size={24} />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-bold flex items-center gap-2 text-white">
                <span>{defaultLabel}</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-normal">
                  سريع ومريح
                </span>
              </h4>
              <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                {sublabel || 'وصول فوري للشجرة من شاشتك بدون كتابة الرابط في كل مرة، وتجربة سلسة كتطبيق هاتف وحاسوب'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs md:text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-xl transition-all cursor-pointer active:scale-95 animate-pulse"
          >
            <Download size={16} />
            <span>تثبيت الأيقونة الآن</span>
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs ${className}`}
          title="تثبيت أيقونة الموقع في سطح المكتب"
        >
          <Download size={14} className="text-emerald-600" />
          <span>{defaultLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 w-full active:scale-95 cursor-pointer ${className}`}
        >
          <Download size={18} />
          <span>{defaultLabel}</span>
        </button>
      )}

      {/* Instructions Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl text-right font-sans">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                {isIOS ? <Smartphone size={24} /> : <Monitor size={24} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isIOS ? 'تثبيت الموقع على أجهزة آيفون / آيباد' : 'تثبيت أيقونة الموقع على سطح المكتب'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">خطوات بسيطة وسريعة لإضافة الموقع</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري بالأسفل.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>مرر للأسفل في القائمة واختر <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>اضغط <strong>إضافة (Add)</strong> بالأعلى لتظهر أيقونة الشجرة على شاشتك الرئيسية فوراً.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">من شريط العنوان بالمتصفح (Chrome أو Edge):</strong>
                    <span>انقر على أيقونة التثبيت <strong>(⊕ أو رمز الشاشة وسهم التثبيت)</strong> الموجودة أقصى يسار شريط الرابط.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">أو من قائمة المتصفح (النقاط الثلاث ⋮):</strong>
                    <span>اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو من «مزيد من الأدوات» اختر <strong>«إنشاء اختصار»</strong> ثم ضع علامة على «فتح كنافذة».</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">على أجهزة الأندرويد:</strong>
                    <span>اضغط على خيارات المتصفح (⋮) ثم اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> أو <strong>«تثبيت التطبيق»</strong>.</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
