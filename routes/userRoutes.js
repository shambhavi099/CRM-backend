const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createManager, getManagers ,deleteManager, updateManagerProfile } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/manager",
  authMiddleware,
  roleMiddleware(["admin"]), 
  upload.fields([
  {
    name: "profilePicture",
    maxCount: 1,
  },
]),
  createManager
);

router.get(
  "/managers",
  authMiddleware,
  roleMiddleware(["admin"]),
  getManagers
);
router.delete(
  "/manager/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteManager
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["manager"]),
  upload.single("profilePicture"),
  updateManagerProfile
);
module.exports = router;
