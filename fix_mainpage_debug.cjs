const fs = require('fs');
let code = fs.readFileSync('src/components/MainPage.tsx', 'utf8');

const brokenBlock = `            if (activeUsers.length === 0) {
              return (
                <div className="text-center py-6 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p>لا يوجد أي أعضاء نشطين في هذه اللحظة.</p>
                </div>
              );
            }`;

const fixedBlock = `            if (activeUsers.length === 0) {
              return (
                <div className="text-center py-6 text-slate-400">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p>لا يوجد أي أعضاء نشطين في هذه اللحظة.</p>
                  {/* Debug Info */}
                  {currentSession.role === 'member' && (
                    <div className="mt-4 p-2 bg-slate-50 text-slate-500 text-xs text-center border border-slate-200 rounded-lg">
                      معلومات تقنية (ستُحذف قريباً): {onlineUsers.length} متصل | اسم الجلسة: {currentSession.name}
                    </div>
                  )}
                </div>
              );
            }`;

code = code.replace(brokenBlock, fixedBlock);
fs.writeFileSync('src/components/MainPage.tsx', code);
console.log("Added debug back safely");
