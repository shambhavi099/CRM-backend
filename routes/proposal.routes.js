const express = require("express");
const router = express.Router();

const {
  getProposals,
  createProposal,
  getProposalById,
  updateProposal,
  deleteProposal,
} = require("../controllers/proposal.controller");

const validateProposal = require("../middleware/validateProposal.middleware");

router.get("/", getProposals);
router.post("/", validateProposal, createProposal);
router.get("/:id", getProposalById);
router.put("/:id", validateProposal, updateProposal);
router.delete("/:id", deleteProposal);

module.exports = router;
