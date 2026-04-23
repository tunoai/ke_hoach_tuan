import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for lich-tuan-4eacb
const firebaseConfig = {
  apiKey: "AIzaSyDyRXg27pjW8IBIYnnRqPqlNRNlFqEY5n4",
  authDomain: "lich-tuan-4eacb.firebaseapp.com",
  projectId: "lich-tuan-4eacb",
  storageBucket: "lich-tuan-4eacb.firebasestorage.app",
  messagingSenderId: "775889776423",
  appId: "1:775889776423:web:c843a273eae09dd9cb8302"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
