const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      {/* Collapsible interactive role testing simulator - Admin Only */}
      {isAdminSession && (
        <RoleSimulator
          currentSession={currentSession}
          onChangeSession={setCurrentSession}
          pendingCount={requests.filter(r => r.status === 'pending').length}
        />
      )}`;

const newStr = `      {/* Collapsible interactive role testing simulator */}
      <RoleSimulator
        currentSession={currentSession}
        onChangeSession={setCurrentSession}
        pendingCount={requests.filter(r => r.status === 'pending').length}
      />`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx successfully");
} else {
  console.log("Could not find the exact string.");
}
