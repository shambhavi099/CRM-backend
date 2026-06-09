const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  resetPassword,
} = require(
  "../controllers/password.controller"
);

router.put(
  "/reset",
  authMiddleware,
  roleMiddleware(["admin, manager"]),
  resetPassword
);

module.exports = router;