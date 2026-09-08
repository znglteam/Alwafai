const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

// 1. Update membersByFather to sort by orderIndex
code = code.replace(
  '        map[m.fatherId].push(m);\n      }\n    });\n    return map;\n  }, [members]);',
  '        map[m.fatherId].push(m);\n      }\n    });\n    Object.keys(map).forEach(fatherId => {\n      map[fatherId].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));\n    });\n    return map;\n  }, [members]);'
);

// 2. Update handleDrop to reorder siblings and update orderIndex
const handleDropOld = `    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      const draggedIndex = members.findIndex(m => m.id === draggedId);
      const targetIndex = members.findIndex(m => m.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newMembers = [...members];
        const [removed] = newMembers.splice(draggedIndex, 1);
        
        // Find new target index in the modified array
        const newTargetIndex = newMembers.findIndex(m => m.id === targetId);
        newMembers.splice(newTargetIndex, 0, removed);

        if (onUpdateMembers) {
          onUpdateMembers(newMembers);
        }
      }
    }`;

const handleDropNew = `    if (draggedMember && targetMember && draggedMember.fatherId === targetMember.fatherId && canUserReorderSiblingsOf(draggedMember)) {
      const parentId = draggedMember.fatherId;
      if (parentId && membersByFather[parentId]) {
        const siblings = [...membersByFather[parentId]];
        const draggedIndex = siblings.findIndex(m => m.id === draggedId);
        const targetIndex = siblings.findIndex(m => m.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = siblings.splice(draggedIndex, 1);
          // find new target index
          const newTargetIndex = siblings.findIndex(m => m.id === targetId);
          // if dragged down, place after. if dragged up, place before. 
          // splice inserts BEFORE the specified index.
          // let's just use the index of the target
          siblings.splice(newTargetIndex + (draggedIndex < targetIndex ? 1 : 0), 0, removed);
          
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
        }
      }
    }`;

code = code.replace(handleDropOld, handleDropNew);
fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
