import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBlSFCFiOzj3hwFgC2L-ql3HQOysGr2EyA",
  authDomain: "learnem-d29e9.firebaseapp.com",
  projectId: "learnem-d29e9",
  storageBucket: "learnem-d29e9.firebasestorage.app",
  messagingSenderId: "73611710526",
  appId: "1:73611710526:web:3edea4ec7132d098b6016f",
  measurementId: "G-7PSQE3CM9G",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
