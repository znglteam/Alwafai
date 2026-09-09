const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `          {activeTab === 'admin' && currentSession.role === 'admin' && (
            <AdminPanel
              requests={requests}
              members={members}
              news={news}
              photos={photos}`;

const newStr = `          {activeTab === 'admin' && currentSession.role === 'admin' && (
            <AdminPanel
              onlineUsers={onlineUsers}
              requests={requests}
              members={members}
              news={news}
              photos={photos}`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched AdminPanel props in App.tsx");
