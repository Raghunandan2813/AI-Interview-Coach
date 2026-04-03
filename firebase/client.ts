// Import the functions you need from the SDKs you need
import { initializeApp , getApp, getApps} from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDOi1Qp6pt7F1hXLLfltmX9Es17F3Jym-Y",
  authDomain: "ai-interview-c5fab.firebaseapp.com",
  projectId: "ai-interview-c5fab",
  storageBucket: "ai-interview-c5fab.firebasestorage.app",
  messagingSenderId: "1084598853673",
  appId: "1:1084598853673:web:1672b8d3c06b467dd87c38",
  measurementId: "G-QVZMPBNLWS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);  
export const storage = getStorage(app);