const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

const oldDrop = `    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      const parentId = draggedMember.fatherId;
      if (parentId && membersByFather[parentId]) {`;

const newDrop = `    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      const parentId = draggedMember.fatherId;
      if (parentId && membersByFather[parentId]) {`;

code = code.replace(
  /if \(draggedMember && targetMember && .*?canUserReorderSiblingsOf\(draggedMember\)\) {/,
  'if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
