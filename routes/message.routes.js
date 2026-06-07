const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  sendTestEmail,
  getRecipients,
  sendEmail
} = require("../controllers/messageController");


//For testing purpose
router.post(
  "/test",
  authMiddleware,
  roleMiddleware(["admin"]),
  sendTestEmail
);

router.get(
  "/recipients/:role",
  authMiddleware,
  roleMiddleware(["admin"]),
  getRecipients
);

router.post(
    "/send",
    authMiddleware,
    roleMiddleware(["admin"]),
    sendEmail
)

module.exports = router;