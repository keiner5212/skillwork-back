import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { createDebugger } from "../utils/debugConfig";
import { config } from "dotenv";

config();
const log = createDebugger('firebaseDB');
const logError = log.extend('error');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGE_SENDER_ID,
  appId: process.env.FB_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const auth = getAuth(app);

// Function to sign in a user
const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in
    const user = userCredential.user;
    log("User signed in: %s", user.uid);
  } catch (error) {
    logError("Error signing in:", error);
  }
};

// sign in API user with email and password
log("Trying to sign in API user...(email: %s)", process.env.FB_API_USER_EMAIL ?? '')
signInUser(process.env.FB_API_USER_EMAIL ?? '', process.env.FB_API_USER_PASSWORD ?? '');

export { db, auth };