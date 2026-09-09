const fs = require('fs');
let code = fs.readFileSync('src/components/MainPage.tsx', 'utf8');

const targetStr = `            const activeUsers = onlineUsers.filter(u => (new Date().getTime() - new Date(u.lastActive).getTime()) < (5 * 60 * 1000));
            if (activeUsers.length === 0) {`;

const newStr = `            const activeUsers = onlineUsers.filter(u => (new Date().getTime() - new Date(u.lastActive).getTime()) < (5 * 60 * 1000));
            
            if (activeUsers.length === 0) {
              return (
                <div className="text-center py-6 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p>لا يوجد أي أعضاء نشطين في هذه اللحظة.</p>
                  {/* Debug */}
                  <div className="mt-4 p-2 bg-red-50 text-red-500 text-xs text-left dir-ltr">
                    Debug: Total onlineUsers = {onlineUsers.length} | currentSession = {currentSession.name}
                  </div>
                </div>
              );
            }`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/MainPage.tsx', code);
