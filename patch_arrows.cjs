const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  "Trash2, Plus, Minus, ZoomIn, ZoomOut, Mars, Venus, Edit2, GripVertical, MessageSquare, Check, UserCheck, Download, Printer, RefreshCw",
  "Trash2, Plus, Minus, ZoomIn, ZoomOut, Mars, Venus, Edit2, GripVertical, MessageSquare, Check, UserCheck, Download, Printer, RefreshCw, ArrowRight, ArrowLeft, ArrowUp, ArrowDown"
);

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
  "// Handle Drag and Drop for Nodes",
  moveSiblingFn + "\n  // Handle Drag and Drop for Nodes"
);

code = code.replace(
  "            {isReorderMode && canUserReorderSiblingsOf(node) && (\n              <div \n                \n                className=\"absolute -top-4 left-1/2 -translate-x-1/2 p-1 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white rounded-lg shadow-md cursor-grab active:cursor-grabbing z-30 flex items-center justify-center transition-all scale-110\"\n                title=\"اسحب لتغيير ترتيب هذا الأخ\"\n              >\n                <GripVertical size={11} />\n              </div>\n            )}",
  `            {isReorderMode && canUserReorderSiblingsOf(node) && (
              <div className={\`absolute \${layoutDirection === 'horizontal' ? '-left-6 top-1/2 -translate-y-1/2 flex-col' : '-top-8 left-1/2 -translate-x-1/2 flex-row'} flex gap-1 z-30 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-amber-200\`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveSibling(node.id, 1); }} 
                  className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                  title="تحريك للأسفل / لليسار"
                >
                  {layoutDirection === 'horizontal' ? <ArrowDown size={14} strokeWidth={2.5} /> : <ArrowLeft size={14} strokeWidth={2.5} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveSibling(node.id, -1); }} 
                  className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                  title="تحريك للأعلى / لليمين"
                >
                  {layoutDirection === 'horizontal' ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowRight size={14} strokeWidth={2.5} />}
                </button>
              </div>
            )}`
);

// Remove Draggable completely from children mapping
code = code.replace(
  /draggable={isReorderMode && canUserReorderSiblingsOf\(child\)}\n                    onDragStart={\(e\) => handleDragStart\(e, child\.id\)}\n                    onDragOver={\(e\) => handleDragOver\(e, child\.id\)}\n                    onDrop={\(e\) => handleDrop\(e, child\.id\)}\n                    onDragEnd={handleDragEnd}\n                    onDragLeave={handleDragLeave}/g,
  ''
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
