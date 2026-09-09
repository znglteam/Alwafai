const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!code.includes('UserPresence')) {
  code = code.replace(/FamilyMessage, LiveChangeLog/g, 'FamilyMessage, LiveChangeLog, UserPresence');
}

code = code.replace(`interface AdminPanelProps {`, `interface AdminPanelProps {\n  onlineUsers?: UserPresence[];`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel.tsx props");
