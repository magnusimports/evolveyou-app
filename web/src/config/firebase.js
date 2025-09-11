// Firebase Configuration for EvolveYou
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-PuRkqWjiz2Sbv0jLVq0b9NOp9kIFwdI",
  authDomain: "evolveyou-prod.firebaseapp.com",
  projectId: "evolveyou-prod",
  storageBucket: "evolveyou-prod.appspot.com",
  messagingSenderId: "589877359572",
  appId: "1:589877359572:web:evolveyou-web"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

