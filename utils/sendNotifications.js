const { admin, db } = require("../FirebaseAdmin");

const sendNotifications = async (
  title,
  message,
  type,
  recipients = []
) => {
  try {
    await db.collection("notifications").add({
      title,
      message,
      type,
      recipients,
      isRead: false,
      createdAt: new Date(),
    });

    console.log("Notification Created");
  } catch (err) {
    console.error("Notification send failed:", err);
  }
};

module.exports = sendNotifications;