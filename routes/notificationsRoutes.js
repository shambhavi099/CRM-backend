const express = require("express");

const router = express.Router();

const { getNotifications, markAsRead} = require("../controllers/notificationsController");
const authMiddleware = require("../middleware/authMiddleware")

router.get("/", authMiddleware,getNotifications)
router.patch("/:id/read",markAsRead)

module.exports = router;