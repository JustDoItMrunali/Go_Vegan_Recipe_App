import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJhuIqxdmW_GCFMcrYb3PtFOWar9wEXAY",
  authDomain: "go-vegan-recipes.firebaseapp.com",
  projectId: "go-vegan-recipes",
  storageBucket: "go-vegan-recipes.firebasestorage.app",
  messagingSenderId: "1082639104593",
  appId: "1:1082639104593:web:161a03e24b588c59e8d670"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);