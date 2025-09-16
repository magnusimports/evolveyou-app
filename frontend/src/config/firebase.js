// Firebase Configuration for EvolveYou Frontend
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase config object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  // Only connect to emulators if explicitly enabled
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Export the app instance
export default app;

// API Endpoints Configuration
export const API_ENDPOINTS = {
  createUser: import.meta.env.VITE_API_CREATE_USER,
  getUserProfile: import.meta.env.VITE_API_GET_USER_PROFILE,
  updateUserProfile: import.meta.env.VITE_API_UPDATE_USER_PROFILE,
  completeOnboarding: import.meta.env.VITE_API_COMPLETE_ONBOARDING,
  generateWorkoutPlan: import.meta.env.VITE_API_GENERATE_WORKOUT_PLAN,
  getUserWorkoutPlans: import.meta.env.VITE_API_GET_USER_WORKOUT_PLANS,
  logWorkoutProgress: import.meta.env.VITE_API_LOG_WORKOUT_PROGRESS,
  getExercises: import.meta.env.VITE_API_GET_EXERCISES,
  generateNutritionPlan: import.meta.env.VITE_API_GENERATE_NUTRITION_PLAN,
  searchFoods: import.meta.env.VITE_API_SEARCH_FOODS,
  logFoodIntake: import.meta.env.VITE_API_LOG_FOOD_INTAKE,
  generateProgressReport: import.meta.env.VITE_API_GENERATE_PROGRESS_REPORT,
  getUserAnalytics: import.meta.env.VITE_API_GET_USER_ANALYTICS,
  healthCheck: import.meta.env.VITE_API_HEALTH_CHECK
};

// Helper function to make authenticated API calls
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

