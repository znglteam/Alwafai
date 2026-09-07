const fs = require('fs');
const file = 'src/utils/firebaseService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(value !== null && typeof value === 'object' && !Array\.isArray\(value\) && !\(value instanceof Date\)\) {\s*cleaned\[key\] = cleanForFirestore\(value\);\s*} else {\s*cleaned\[key\] = value;\s*}/,
  `if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanForFirestore(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(v => 
          (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) 
            ? cleanForFirestore(v) 
            : v
        ).filter(v => v !== undefined);
      } else {
        cleaned[key] = value;
      }`
);
fs.writeFileSync(file, code);
