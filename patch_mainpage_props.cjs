const fs = require('fs');
let code = fs.readFileSync('src/components/MainPage.tsx', 'utf8');

if (!code.includes('UserPresence')) {
  code = code.replace(/FamilyPhoto, MemberComment, UserSession/g, "FamilyPhoto, MemberComment, UserSession, UserPresence");
}

code = code.replace(`interface MainPageProps {`, `interface MainPageProps {\n  onlineUsers?: UserPresence[];`);
code = code.replace(`export default function MainPage({`, `export default function MainPage({\n  onlineUsers = [],`);

fs.writeFileSync('src/components/MainPage.tsx', code);
console.log("Patched MainPage props");
