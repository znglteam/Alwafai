const fs = require('fs');
let code = fs.readFileSync('src/components/Forum.tsx', 'utf8');

const importTarget = `import { MessageSquareText, Plus, User, Clock, MessageCircle, Send, ArrowRight, CornerDownLeft } from 'lucide-react';`;
const importNew = `import { MessageSquareText, Plus, User, Clock, MessageCircle, Send, ArrowRight, CornerDownLeft, ChevronRight } from 'lucide-react';`;

code = code.replace(importTarget, importNew);
fs.writeFileSync('src/components/Forum.tsx', code);
console.log("Patched Forum.tsx");
