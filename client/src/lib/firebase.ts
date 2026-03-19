import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUvguu6D6hD9-T75ndr7jnG75dcAS_JEc",
  authDomain: "smartops-3e1a9.firebaseapp.com",
  projectId: "smartops-3e1a9",
  storageBucket: "smartops-3e1a9.firebasestorage.app",
  messagingSenderId: "659877434439",
  appId: "1:659877434439:web:29c9ab62d49698838e74d62",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

export default app;
