const express = require("express");
const router = express.Router();

const {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoice.controller");

const validateInvoice = require("../middleware/validateInvoice.middleware");

router.get("/", getInvoices);

router.post("/", validateInvoice, createInvoice);

router.put("/:id", validateInvoice, updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;
