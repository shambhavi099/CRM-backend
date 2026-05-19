require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.VITE_FIREBASE_API_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


module.exports = { admin, db };
