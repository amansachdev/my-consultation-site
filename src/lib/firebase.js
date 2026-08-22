import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const publicConfig = {
  apiKey: 'AIzaSyBBnY1Vj435gZuZpiFWUUzvDqRnBZNehqg',
  authDomain: 'antaran-c4ae2.firebaseapp.com',
  projectId: 'antaran-c4ae2',
  storageBucket: 'antaran-c4ae2.firebasestorage.app',
  messagingSenderId: '809124978904',
  appId: '1:809124978904:web:214be578156bce115377ad',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || publicConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || publicConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || publicConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || publicConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || publicConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || publicConfig.appId,
};

const configured = Object.values(firebaseConfig).every(Boolean);
const app = configured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const firebaseAuth = app ? getAuth(app) : null;
export const firebaseConfigured = configured;
