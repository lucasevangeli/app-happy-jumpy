import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const database = getDatabase(app);

export { auth, database };
