const fs = require('fs');
let code = fs.readFileSync('src/components/FamilyTreeVisualizer.tsx', 'utf8');

code = code.replace(
  '                    className={`flex flex-col items-center relative px-2 md:px-4 shrink-0 pt-6 transition-all duration-300 ${',
  '                    className={`flex ${layoutDirection === \'horizontal\' ? \'flex-row items-center pr-6 py-2 md:py-4\' : \'flex-col items-center pt-6 px-2 md:px-4\'} relative shrink-0 transition-all duration-300 ${'
);

code = code.replace(
  '                    {/* Horizontal connector line */}\n                    {children.length > 1 && (\n                      <div \n                        className={`absolute top-0 h-[2px] bg-indigo-300 ${\n                          isFirst \n                            ? \'right-1/2 left-0\' \n                            : isLast \n                              ? \'left-1/2 right-0\' \n                              : \'left-0 right-0\'\n                        }`}\n                      ></div>\n                    )}',
  '                    {/* Sibling connecting line */}\n                    {children.length > 1 && (\n                      <div \n                        className={`absolute bg-indigo-300 ${\n                          layoutDirection === \'horizontal\'\n                            ? `right-0 w-[2px] ${\n                                isFirst ? \'top-1/2 bottom-0\' : isLast ? \'top-0 bottom-1/2\' : \'top-0 bottom-0\'\n                              }`\n                            : `top-0 h-[2px] ${\n                                isFirst ? \'right-1/2 left-0\' : isLast ? \'left-1/2 right-0\' : \'left-0 right-0\'\n                              }`\n                        }`}\n                      ></div>\n                    )}'
);

code = code.replace(
  '                    {/* Vertical line to this child */}\n                    <div className="absolute top-0 left-0 right-0 flex justify-center"><div className="w-[2px] h-6 bg-indigo-300"></div></div>',
  '                    {/* Line to this child */}\n                    <div className={`absolute flex ${layoutDirection === \'horizontal\' ? \'right-0 top-0 bottom-0 items-center\' : \'top-0 left-0 right-0 justify-center\'}`}><div className={`bg-indigo-300 ${layoutDirection === \'horizontal\' ? \'w-6 h-[2px]\' : \'w-[2px] h-6\'}`}></div></div>'
);

fs.writeFileSync('src/components/FamilyTreeVisualizer.tsx', code);
