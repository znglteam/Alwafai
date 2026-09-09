const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const stateTarget = `const [activeTab, setActiveTab] = useState<'requests' | 'tree' | 'news' | 'photos' | 'messages' | 'logs'>('requests');`;
const stateNew = `const [activeTab, setActiveTab] = useState<'requests' | 'tree' | 'news' | 'photos' | 'messages' | 'logs' | 'online'>('requests');`;
code = code.replace(stateTarget, stateNew);

const btnTarget = `          <button
            onClick={() => setActiveTab('logs')}`;
const btnNew = `          <button
            onClick={() => setActiveTab('online')}
            className={\`pb-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 \${
              activeTab === 'online' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }\`}
          >
            <Activity size={18} />
            المتواجدون الآن
            {onlineUsers.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-black animate-pulse">
                {onlineUsers.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}`;
code = code.replace(btnTarget, btnNew);

const tabTarget = `        {activeTab === 'logs' && (`;
const tabNew = `        {activeTab === 'online' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={24} className="text-emerald-500" />
              الأعضاء المتواجدون حالياً
            </h3>
            
            {onlineUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users size={32} className="mx-auto mb-3 opacity-50" />
                <p>لا يوجد أي أعضاء نشطين في هذه اللحظة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onlineUsers.map(user => {
                  const isActive = (new Date().getTime() - new Date(user.lastActive).getTime()) < (5 * 60 * 1000); // 5 mins
                  return (
                    <div key={user.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className={\`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white \${isActive ? 'bg-emerald-500' : 'bg-slate-400'}\`}></div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.role === 'admin' ? 'مدير' : 'عضو'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">آخر نشاط: {new Date(user.lastActive).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'logs' && (`;
code = code.replace(tabTarget, tabNew);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel tabs");
