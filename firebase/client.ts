// Import the functions you need from the SDKs you need
import { initializeApp , getApp, getApps} from "firebase/app";
import { getAuth } from "firebase/auth";
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

// Auth only. Firestore and Storage are reached exclusively through the Admin
// SDK in server actions — exporting browser handles here would hand every
// visitor a direct line to the database.
export const auth = getAuth(app);