const validateProposal = (req, res, next) => {
  const {
    proposalTitle,
    clientName,
    amount,
    currency,
  } = req.body;

  if (!proposalTitle || proposalTitle.trim() === "") {
    return res.status(400).json({
      message: "Proposal title is required",
    });
  }

  if (!clientName || clientName.trim() === "") {
    return res.status(400).json({
      message: "Client is required",
    });
  }

  if (!amount || isNaN(amount)) {
    return res.status(400).json({
      message: "Valid amount is required",
    });
  }

  if (!currency) {
    return res.status(400).json({
      message: "Currency is required",
    });
  }

  next();
};

module.exports = validateProposal;
