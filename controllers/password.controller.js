const { db } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  try {
    const { role } = req.user;

    const {
      targetCollection,
      targetUserId,
      newPassword,
    } = req.body;

    // Only admin and manager allowed
    if (
      role !== "admin" &&
      role !== "manager"
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Managers cannot reset managers/admins
    if (
      role === "manager" &&
      targetCollection === "users"
    ) {
      return res.status(403).json({
        message:
          "Managers can only reset employee/client passwords",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await db
      .collection(targetCollection)
      .doc(targetUserId)
      .update({
        password: hashedPassword,
      });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  resetPassword,
};