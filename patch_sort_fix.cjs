const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  "    } else {\n      Object.keys(map).forEach(key => {\n        map[key].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));\n      });\n    }",
  "    } else {\n      Object.keys(map).forEach(key => {\n        map[key].sort((a, b) => {\n          const indexA = a.orderIndex !== undefined ? a.orderIndex : members.findIndex(m => m.id === a.id);\n          const indexB = b.orderIndex !== undefined ? b.orderIndex : members.findIndex(m => m.id === b.id);\n          return indexA - indexB;\n        });\n      });\n    }"
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
