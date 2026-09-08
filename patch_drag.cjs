const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  'draggable={canDragId === child.id}',
  'draggable={isReorderMode && canUserReorderSiblingsOf(child)}'
);

code = code.replace(
  'onMouseDown={() => setCanDragId(node.id)}\n                onMouseUp={() => setCanDragId(null)}\n                onTouchStart={() => setCanDragId(node.id)}\n                onTouchEnd={() => setCanDragId(null)}',
  ''
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
