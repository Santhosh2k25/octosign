import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD1D-dTpF04okErMoGcKGpUN7-JjIaLYak",
  authDomain: "octogsign.firebaseapp.com",
  projectId: "octogsign",
  storageBucket: "octogsign.firebasestorage.app",
  messagingSenderId: "404305027344",
  appId: "1:404305027344:web:4320fd94e4b1b8904f4595",
  measurementId: "G-1GJ01LBEKH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;