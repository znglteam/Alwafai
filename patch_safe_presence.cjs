const fs = require('fs');
let code = fs.readFileSync('src/utils/firebaseService.ts', 'utf8');

code = code.replace(
  `    const docRef = doc(db, 'presence', presence.id);
    await setDoc(docRef, presence);`,
  `    if (!presence.id) return;
    const safeId = presence.id.toString().replace(/\\//g, '_');
    const docRef = doc(db, 'presence', safeId);
    await setDoc(docRef, cleanForFirestore({...presence, id: safeId}), { merge: true });`
);

fs.writeFileSync('src/utils/firebaseService.ts', code);
console.log("Patched safe presence");
