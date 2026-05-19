const express = require("express");
const router = express.Router();

const {
  getClients,
  createClient,
  getClientCount,
  updateClient,
  deleteClient,
} = require("../controllers/client.controller");

const validateClient = require("../middleware/validateClient.middleware");

router.get("/", getClients);

router.get("/count", getClientCount);

router.post("/", validateClient, createClient);
router.put("/:id", validateClient, updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
