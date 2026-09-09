const fs = require('fs');

let forumCode = fs.readFileSync('src/components/Forum.tsx', 'utf8');
const oldFormatDate = `  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };`;

const newFormatDate = `  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return \`\${date.getDate()}-\${date.getMonth() + 1}-\${date.getFullYear()}\`;
  };`;
  
if(forumCode.includes(oldFormatDate)) {
    forumCode = forumCode.replace(oldFormatDate, newFormatDate);
    fs.writeFileSync('src/components/Forum.tsx', forumCode);
    console.log('Patched Forum.tsx successfully');
} else {
    console.log('Target string not found in Forum.tsx');
}
