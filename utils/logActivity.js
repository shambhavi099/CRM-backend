const { admin, db } = require("../FirebaseAdmin");

const logActivity = async (type, message) => {
  try {
    await db.collection("activities").add({
      type,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Activity log failed:", err);
  }
};

module.exports = logActivity;
