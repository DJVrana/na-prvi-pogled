import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsY249cTK2UK6ETafo5TI-aTc62L9_8IA",
  authDomain: "na-prvi-pogled.firebaseapp.com",
  projectId: "na-prvi-pogled",
  storageBucket: "na-prvi-pogled.firebasestorage.app",
  messagingSenderId: "435779332050",
  appId: "1:435779332050:web:47dcbd8281dc28ed15ca0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { app, db, auth, provider };
