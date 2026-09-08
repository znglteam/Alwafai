const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  "    const member = members.find(m => m.id === memberId);\n    if (!member) return;\n    const parentId = member.fatherId || member.motherId;\n    if (!parentId || !membersByFather[parentId]) return;",
  "    console.log('moveSibling called', memberId, direction);\n    const member = members.find(m => m.id === memberId);\n    if (!member) { console.log('member not found'); return; }\n    const parentId = member.fatherId || member.motherId;\n    if (!parentId) { console.log('no parentId'); return; }\n    if (!membersByFather[parentId]) { console.log('no membersByFather for parentId', parentId); return; }"
);

code = code.replace(
  "    const targetIndex = currentIndex + direction;\n    if (targetIndex < 0 || targetIndex >= siblings.length) return; // Cannot move further",
  "    const targetIndex = currentIndex + direction;\n    if (targetIndex < 0 || targetIndex >= siblings.length) { console.log('cannot move further', currentIndex, targetIndex); return; } // Cannot move further"
);

code = code.replace(
  "    if (onUpdateMembers) {\n      onUpdateMembers(newMembers);\n    }",
  "    if (onUpdateMembers) {\n      console.log('calling onUpdateMembers');\n      onUpdateMembers(newMembers);\n    } else { console.log('no onUpdateMembers'); }"
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
