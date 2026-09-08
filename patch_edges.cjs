const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

const oldBlock = `            {/* Drag Handle for Reordering Siblings */}
            {isReorderMode && canUserReorderSiblingsOf(node) && (
              <div className={\`absolute \${layoutDirection === 'horizontal' ? '-left-6 top-1/2 -translate-y-1/2 flex-col' : '-top-8 left-1/2 -translate-x-1/2 flex-row'} flex gap-1 z-30 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-amber-200\`}>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, 1); }} type="button" 
                  className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                  title="تحريك للأسفل / لليسار"
                >
                  {layoutDirection === 'horizontal' ? <ArrowDown size={14} strokeWidth={2.5} /> : <ArrowLeft size={14} strokeWidth={2.5} />}
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, -1); }} type="button" 
                  className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                  title="تحريك للأعلى / لليمين"
                >
                  {layoutDirection === 'horizontal' ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowRight size={14} strokeWidth={2.5} />}
                </button>
              </div>
            )}`;

const newBlock = `            {/* Drag Handle for Reordering Siblings */}
            {(() => {
              if (!isReorderMode || !canUserReorderSiblingsOf(node)) return null;
              const parentId = node.fatherId || node.motherId;
              if (!parentId) return null;
              const siblings = membersByFather[parentId] || [];
              if (siblings.length <= 1) return null; // No need to reorder an only child
              const nodeIndex = siblings.findIndex(m => m.id === node.id);
              const isFirst = nodeIndex === 0;
              const isLast = nodeIndex === siblings.length - 1;
              return (
                <div className={\`absolute \${layoutDirection === 'horizontal' ? '-left-6 top-1/2 -translate-y-1/2 flex-col' : '-top-8 left-1/2 -translate-x-1/2 flex-row'} flex gap-1 z-30 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-amber-200\`}>
                  {!isLast && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, 1); }} type="button" 
                      className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                      title="تحريك للأسفل / لليسار"
                    >
                      {layoutDirection === 'horizontal' ? <ArrowDown size={14} strokeWidth={2.5} /> : <ArrowLeft size={14} strokeWidth={2.5} />}
                    </button>
                  )}
                  {!isFirst && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, -1); }} type="button" 
                      className="p-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full transition-all flex items-center justify-center" 
                      title="تحريك للأعلى / لليمين"
                    >
                      {layoutDirection === 'horizontal' ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowRight size={14} strokeWidth={2.5} />}
                    </button>
                  )}
                </div>
              );
            })()}`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
  console.log('Patched successfully.');
} else {
  console.log('Old block not found.');
}
