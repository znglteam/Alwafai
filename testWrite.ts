import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0131349304",
  appId: "1:803024720627:web:9c91b5dc77bc2eacaa1d86",
  apiKey: "AIzaSyA3f9euLz3BavCgYJs-l06BWf0ke7pdRb0",
  authDomain: "gen-lang-client-0131349304.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-69be9d34-a864-43d5-8d57-2894aa046237"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    await setDoc(doc(db, 'family_requests', 'test-write-123'), { name: "test" });
    console.log("Write success!");
  } catch(e) {
    console.error("Write error:", e);
  }
}
run();
