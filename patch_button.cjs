const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `        <button
          onClick={() => setActiveTab('logs')}`;

const newStr = `        <button
          onClick={() => setActiveTab('online')}
          className={\`pb-3 px-6 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-1.5 \${
            activeTab === 'online' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }\`}
        >
          <Activity size={14} className={activeTab === 'online' ? 'text-emerald-500' : 'text-slate-400'} />
          المتواجدون
          {activeUsers.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-md font-black animate-pulse">
              {activeUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched button successfully.");
} else {
  console.log("Failed to find target string for button.");
}
