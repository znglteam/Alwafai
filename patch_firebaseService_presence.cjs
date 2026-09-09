const fs = require('fs');
let code = fs.readFileSync('src/utils/firebaseService.ts', 'utf8');

// import UserPresence if not already there
if(!code.includes('UserPresence')) {
  code = code.replace(/FamilyMessage } from '\.\.\/types';/, "FamilyMessage, UserPresence } from '../types';");
}

if(!code.includes('subscribeToPresence')) {
  code += `\nexport function subscribeToPresence(onPresence: (presences: UserPresence[]) => void) {
  const q = query(collection(db, 'presence'), orderBy('lastActive', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const presences = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserPresence));
    onPresence(presences);
  });
}

export async function updateUserPresence(presence: UserPresence) {
  try {
    const docRef = doc(db, 'presence', presence.id);
    await setDoc(docRef, presence);
  } catch(e) {
    console.error("Error updating presence:", e);
  }
}\n`;
  fs.writeFileSync('src/utils/firebaseService.ts', code);
  console.log('Patched firebaseService.ts');
}
