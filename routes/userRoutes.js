const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createManager, getManagers ,deleteManager} = require("../controllers/userController");

router.post(
  "/manager",
  authMiddleware,
  roleMiddleware(["admin"]), 
  createManager
);
router.get(
  "/managers",
  getManagers
);
router.delete(
  "/manager/:id",
  deleteManager
);

module.exports = router;
