import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAkcwGL8g8jOCOFf5aPh4bMXuRhByTr6vU",
  authDomain: "dragon-badges.firebaseapp.com",
  projectId: "dragon-badges",
  storageBucket: "dragon-badges.appspot.com",
  messagingSenderId: "427931029714",
  appId: "1:427931029714:web:ef2d8c4315b6a2649bdd0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)