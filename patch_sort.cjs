const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  "    if (isSortedByAge) {\n      Object.keys(map).forEach(key => {\n        map[key].sort((a, b) => {\n          const yearA = (a.birthYear && a.birthYear > 0) ? a.birthYear : 9999;\n          const yearB = (b.birthYear && b.birthYear > 0) ? b.birthYear : 9999;\n          return yearA - yearB;\n        });\n      });\n    }\n\n    return map;",
  "    if (isSortedByAge) {\n      Object.keys(map).forEach(key => {\n        map[key].sort((a, b) => {\n          const yearA = (a.birthYear && a.birthYear > 0) ? a.birthYear : 9999;\n          const yearB = (b.birthYear && b.birthYear > 0) ? b.birthYear : 9999;\n          return yearA - yearB;\n        });\n      });\n    } else {\n      Object.keys(map).forEach(key => {\n        map[key].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));\n      });\n    }\n\n    return map;"
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
