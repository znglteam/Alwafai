const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore/lite');
const firebaseConfig = {
  projectId: "gen-lang-client-0131349304",
  // we might need more config? No, it's just a REST call, but firebase JS SDK needs api key.
};
