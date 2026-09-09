const fs = require('fs');
let code = fs.readFileSync('src/components/MainPage.tsx', 'utf8');

const anchor = `      <section id="gallery-section" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">`;

const onlineWidget = `
      {/* Online Users Widget - Visible to all members */}
      {(!isGuest) && (
        <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#414141] flex items-center gap-2">
                الأعضاء المتواجدون الآن
                {onlineUsers.filter(u => (new Date().getTime() - new Date(u.lastActive).getTime()) < (5 * 60 * 1000)).length > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-1">تتبع الحضور والنشاط لأفراد العائلة في الوقت الفعلي</p>
            </div>
          </div>
          
          {(() => {
            const activeUsers = onlineUsers.filter(u => (new Date().getTime() - new Date(u.lastActive).getTime()) < (5 * 60 * 1000));
            if (activeUsers.length === 0) {
              return (
                <div className="text-center py-6 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p>لا يوجد أي أعضاء نشطين في هذه اللحظة.</p>
                </div>
              );
            }
            return (
              <div className="flex flex-wrap gap-3">
                {activeUsers.map(user => (
                  <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-full py-1.5 px-3 pr-1.5 flex items-center gap-2 transition-transform hover:scale-105">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{user.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] ml-1 shrink-0"></span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}
`;

code = code.replace(anchor, onlineWidget + "\n" + anchor);

// Add Activity, Users import if needed
if (!code.includes('Activity')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { Activity, Users, $1 } from 'lucide-react';");
}

fs.writeFileSync('src/components/MainPage.tsx', code);
console.log("Patched MainPage.tsx with online widget");
