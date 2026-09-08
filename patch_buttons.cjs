const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); moveSibling\(node\.id, 1\); \}\}/g,
  'onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, 1); }} type="button"'
);

code = code.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); moveSibling\(node\.id, -1\); \}\}/g,
  'onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveSibling(node.id, -1); }} type="button"'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
