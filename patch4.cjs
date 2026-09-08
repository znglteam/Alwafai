const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  '        {hasChildren && isExpanded && (\n          <div className="flex flex-col items-center w-full">\n            {/* Vertical connector from parent to horizontal line */}\n            <div className="w-[2px] h-6 bg-indigo-300"></div>\n\n            {/* Row of children */}\n            <div className="flex flex-row items-start justify-center relative">',
  '        {hasChildren && isExpanded && (\n          <div className={`flex ${layoutDirection === \'horizontal\' ? \'flex-row items-center\' : \'flex-col items-center\'} w-full`}>\n            {/* Connector from parent to children line */}\n            <div className={`bg-indigo-300 ${layoutDirection === \'horizontal\' ? \'w-6 h-[2px]\' : \'w-[2px] h-6\'}`}></div>\n\n            {/* Row or Column of children */}\n            <div className={`flex ${layoutDirection === \'horizontal\' ? \'flex-col items-end\' : \'flex-row items-start\'} justify-center relative`}>'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
