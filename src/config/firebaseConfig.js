import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🌟 Firebase Configuration
// This is the secret sauce that connects our React Native app to the Firebase cloud!
// It contains all the necessary keys and IDs to securely identify our project.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 🚀 Initialize Firebase
// Here we are waking up the Firebase application with our specific config.
const app = initializeApp(firebaseConfig);

// 🔐 Initialize Authentication
// We set up our authentication service here.
// Importantly, we use AsyncStorage to make sure the user stays logged in
// even if they close the app and open it again later (persistence).
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 🗄️ Initialize Firestore Database
// This sets up our connection to the Firestore cloud database
// so we can store, retrieve, and sync our user's resources and tasks.
const db = getFirestore(app);

export { app, auth, db };
