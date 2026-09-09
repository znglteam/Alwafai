const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/FamilyMessage,\n  MemberComment\n} from '\.\/types';/, "FamilyMessage,\n  MemberComment,\n  UserPresence\n} from './types';");

code = code.replace(/subscribeToAuditLogs,\n  seedInitialMembersIfEmpty/, "subscribeToAuditLogs,\n  subscribeToPresence,\n  updateUserPresence,\n  seedInitialMembersIfEmpty");

// Check if patched
if(code.includes('UserPresence') && code.includes('subscribeToPresence')) {
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx imports successfully");
} else {
  console.log("Failed to patch App.tsx imports");
}
