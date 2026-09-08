const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

const moveSiblingFn = `
  const moveSibling = (memberId: string, direction: -1 | 1) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const parentId = member.fatherId || member.motherId;
    if (!parentId || !membersByFather[parentId]) return;

    const siblings = [...membersByFather[parentId]];
    const currentIndex = siblings.findIndex(m => m.id === memberId);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= siblings.length) return; // Cannot move further

    // Swap
    const temp = siblings[currentIndex];
    siblings[currentIndex] = siblings[targetIndex];
    siblings[targetIndex] = temp;

    const newMembers = [...members];
    siblings.forEach((sibling, index) => {
      const mainIndex = newMembers.findIndex(m => m.id === sibling.id);
      if (mainIndex !== -1) {
        newMembers[mainIndex] = { ...newMembers[mainIndex], orderIndex: index };
      }
    });

    if (onUpdateMembers) {
      onUpdateMembers(newMembers);
    }
  };
`;

code = code.replace(
  "  const getDescendantsCount = (nodeId: string): number => {",
  moveSiblingFn + "\n  const getDescendantsCount = (nodeId: string): number => {"
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
