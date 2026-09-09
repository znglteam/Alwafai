const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const [auditLogs, setAuditLogs] = useState<LiveChangeLog[]>([]);`;
const newStr = `  const [auditLogs, setAuditLogs] = useState<LiveChangeLog[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched state");
