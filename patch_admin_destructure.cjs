const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `export default function AdminPanel({
  requests,
  members,`;

const newStr = `export default function AdminPanel({
  onlineUsers = [],
  requests,
  members,`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel destructure");
