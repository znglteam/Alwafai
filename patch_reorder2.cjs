const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  '  const canUserReorderSiblingsOf = useCallback((member: FamilyMember) => {\n    if (!isApprovedMember) return false;\n    if (isAdmin) return true; // Admin has the right to reorder any siblings in the tree\n    if (!currentSession || !currentSession.userId) return false;\n\n    const parentId = member.fatherId || member.motherId;\n    if (!parentId) return false; // Root has no parent/siblings',
  '  const canUserReorderSiblingsOf = useCallback((member: FamilyMember) => {\n    const parentId = member.fatherId || member.motherId;\n    if (!parentId) return false; // Root has no parent/siblings\n\n    if (!isApprovedMember) return false;\n    if (isAdmin) return true; // Admin has the right to reorder any siblings in the tree\n    if (!currentSession || !currentSession.userId) return false;'
);

code = code.replace(
  'if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember))',
  'if (draggedMember && targetMember && (draggedMember.fatherId === targetMember.fatherId || draggedMember.motherId === targetMember.motherId) && canUserReorderSiblingsOf(draggedMember))'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
