const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if(!code.includes('UserPresence')) {
  code += `\nexport interface UserPresence {
  id: string;
  name: string;
  role: string;
  lastActive: string;
}\n`;
  fs.writeFileSync('src/types.ts', code);
  console.log('Patched types.ts');
}
