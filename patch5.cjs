const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  '            {/* Row or Column of children */}\n            <div className={`flex ${layoutDirection === \'horizontal\' ? \'flex-col items-end\' : \'flex-row items-start\'} justify-center relative`}>',
  '            {/* Row or Column of children */}\n            <div className={`flex ${layoutDirection === \'horizontal\' ? \'flex-col items-start\' : \'flex-row items-start\'} justify-center relative`}>'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
