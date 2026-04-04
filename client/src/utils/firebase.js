import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-interview-74564-f6580.firebaseapp.com",
  projectId: "ai-interview-74564-f6580",
  storageBucket: "ai-interview-74564-f6580.firebasestorage.app",
  messagingSenderId: "247783211563",
  appId: "1:247783211563:web:93a26d590c09479a92e06e",
  measurementId: "G-73G1TTGPKC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
