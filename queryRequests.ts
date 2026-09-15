import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  const querySnapshot = await getDocs(collection(db, 'family_requests'));
  console.log(`Found ${querySnapshot.size} requests`);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });
}
run();
