const fs = require('fs');
let code = fs.readFileSync('src/utils/firebaseService.ts', 'utf8');
code = code.replace(
  `    onPresence(presences);
  });`,
  `    onPresence(presences);
  }, (error) => {
    console.error("Presence subscribe error:", error);
  });`
);
fs.writeFileSync('src/utils/firebaseService.ts', code);
