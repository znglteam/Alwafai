const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(/console\.log\('moveSibling called', memberId, direction\);\n/g, '');
code = code.replace(/\{ console\.log\('member not found'\); return; \}/g, 'return;');
code = code.replace(/\{ console\.log\('no parentId'\); return; \}/g, 'return;');
code = code.replace(/\{ console\.log\('no membersByFather for parentId', parentId\); return; \}/g, 'return;');
code = code.replace(/\{ console\.log\('cannot move further', currentIndex, targetIndex\); return; \}/g, 'return;');
code = code.replace(/\{\n\s*console\.log\('calling onUpdateMembers'\);\n\s*onUpdateMembers\(newMembers\);\n\s*\} else \{ console\.log\('no onUpdateMembers'\); \}/g, '{\n      onUpdateMembers(newMembers);\n    }');

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
