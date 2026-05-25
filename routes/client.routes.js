const express = require("express");
const router = express.Router();

const {
  getClientProfile,
  clientLogin,
  getClients,
  createClient,
  getClientCount,
  updateClient,
  deleteClient,
} = require("../controllers/client.controller");
const authMiddleware = require("../middleware/authMiddleware");
const validateClient = require("../middleware/validateClient.middleware");

router.post("/login", clientLogin)

router.get("/", getClients);
router.get("/profile", authMiddleware, getClientProfile)
router.get("/count", getClientCount);

router.post("/", validateClient, createClient);
router.put("/:id", validateClient, updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
