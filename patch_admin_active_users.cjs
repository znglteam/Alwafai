const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const activeLogic = `  const activeUsers = onlineUsers.filter(u => (new Date().getTime() - new Date(u.lastActive).getTime()) < (5 * 60 * 1000));`;
code = code.replace(`export default function AdminPanel({`, `export default function AdminPanel({`); // just to anchor

const anchor = `  const [activeTab, setActiveTab] = useState<'requests' | 'tree' | 'news' | 'photos' | 'messages' | 'logs' | 'online'>('requests');`;
code = code.replace(anchor, anchor + `\n` + activeLogic);

code = code.replace(/{onlineUsers\.length/g, `{activeUsers.length`);
code = code.replace(/onlineUsers\.map/g, `activeUsers.map`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched Active Users Logic");
