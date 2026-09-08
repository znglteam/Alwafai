const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  "  const handleDragStart = (e: React.DragEvent, id: string) => {\n    e.stopPropagation();",
  "  const handleDragStart = (e: React.DragEvent, id: string) => {\n    e.stopPropagation();\n    console.log('Drag Start:', id);"
);

code = code.replace(
  "  const handleDrop = (e: React.DragEvent, targetId: string) => {\n    e.preventDefault();\n    e.stopPropagation();\n    setDragOverId(null);",
  "  const handleDrop = (e: React.DragEvent, targetId: string) => {\n    e.preventDefault();\n    e.stopPropagation();\n    console.log('Drop target:', targetId, 'dragged:', draggedId, 'isReorderMode:', isReorderMode);\n    setDragOverId(null);"
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
