import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFpHL8O2TMskvNzx_71bg68DZONVpAX2Q",
  authDomain: "labelmind.firebaseapp.com",
  projectId: "labelmind",
  storageBucket: "labelmind.firebasestorage.app",
  messagingSenderId: "239602772247",
  appId: "1:239602772247:web:d418d055ca1e071189af52",
  measurementId: "G-B4R8CBKKN8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };