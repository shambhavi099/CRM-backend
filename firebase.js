import { initializeApp } from "firebase-admin";
import {getAuth} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyDmOqnlXusib6p9hFnWzMXn6z23ekH4V1A",
  authDomain: "navrasa-9c732.firebaseapp.com",
  projectId: "navrasa-9c732",
  storageBucket: "navrasa-9c732.firebasestorage.app",
  messagingSenderId: "499626316309",
  appId: "1:499626316309:web:98f8e0a2473dc053ce741c",
  measurementId: "G-FBH6G473EL"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

const getClientCount = async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "clients"));
    res.status(200).json({ total: snapshot.size });
  } catch (error) {
    res.status(500).json({ message: "Failed to get client count" });
  }
};

module.exports = { getClientCount };