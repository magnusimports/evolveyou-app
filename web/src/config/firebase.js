// Firebase Configuration for EvolveYou
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCtt05zPQIHmA3QtObfUvmSGV6VjABAvps",
  authDomain: "evolveyou-prod.firebaseapp.com",
  projectId: "evolveyou-prod",
  storageBucket: "evolveyou-prod.appspot.com",
  messagingSenderId: "278319877545",
  appId: "1:278319877545:web:evolveyou-web"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

