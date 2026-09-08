const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '    const changed = getChangedMembers(members, reconciled);\n    if (changed.length > 0) {\n    }\n\n    \n    return id;',
  '    const changed = getChangedMembers(members, reconciled);\n    if (changed.length > 0) {\n      saveMultipleMembersToCloud(changed).catch(err => console.error("Error saving members to cloud:", err));\n    }\n\n    \n    return id;'
);

fs.writeFileSync('src/App.tsx', code);
