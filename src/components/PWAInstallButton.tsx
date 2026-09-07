import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors w-full justify-center"
      >
        <Download size={18} />
        تثبيت التطبيق على الجهاز
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors w-full justify-center"
        >
          <Download size={18} />
          تثبيت التطبيق على الآيفون
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 dir-rtl text-right">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-slate-900 mb-3">تثبيت التطبيق على جهازك</h3>
              <p className="text-sm text-slate-600 leading-relaxed space-y-2">
                <span className="block">1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري بالأسفل.</span>
                <span className="block">2. مرر للأسفل واختر <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.</span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-sm font-bold text-slate-800 transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // If not installable and not iOS (or we just don't have the prompt yet), we can still show a disabled state or hide it.
  // We'll hide it for a cleaner UI if it's not possible to install.
  return null;
};
