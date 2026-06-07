const express = require("express");
const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  resetPassword,
} = require(
  "../controllers/password.controller"
);

router.put(
  "/reset",
  authMiddleware,
  resetPassword
);

module.exports = router;