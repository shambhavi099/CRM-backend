const transporter = require("../utils/email");
const { db } = require("../FirebaseAdmin");

const getRecipients = async (req, res) => {
  try {
    const { role } = req.params;

    console.log("Role:", role);
    let collectionName;

    if (role === "employees") {
      collectionName = "employees";
    } else if (role === "clients") {
      collectionName = "clients";
    } else if (role === "managers") {
      collectionName = "users";
    } else {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const snapshot = await db
      .collection(collectionName)
      .get();

    let recipients = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      role: doc.data().role,
    }));

    if (role === "managers") {
      recipients = recipients.filter(
        (user) => user.role === "manager"
      );
    }
    return res.status(200).json(recipients);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


const sendEmail = async (req, res) => {
  try {
    const {
      role,
      recipientIds,
      sendToAll,
      subject,
      message,
    } = req.body;

    let collectionName;

    if (role === "employees") {
      collectionName = "employees";
    } else if (role === "clients") {
      collectionName = "clients";
    } else if (role === "managers") {
      collectionName = "users";
    } else {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const snapshot = await db
      .collection(collectionName)
      .get();

    let recipients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Only managers from users collection
    if (role === "managers") {
      recipients = recipients.filter(
        (user) => user.role === "manager"
      );
    }

    // If not sending to all, filter selected recipients
    if (!sendToAll) {
      recipients = recipients.filter((user) =>
        recipientIds.includes(user.id)
      );
    }

    for (const recipient of recipients) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject,
        text: message,
      });
    }

    return res.status(200).json({
      message: `Email sent to ${recipients.length} recipient(s)`,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

//Demo email controller
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "CRM Test Email",
      text: "Congratulations! Email system is working.",
    });

    return res.status(200).json({
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  sendTestEmail,
  getRecipients,
  sendEmail
};