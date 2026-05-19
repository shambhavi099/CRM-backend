const validateInvoice = (req, res, next) => {
  const { invoiceNumber, clientName, amount, currency, dueDate } = req.body;

  if (!invoiceNumber || !clientName || !amount) {
    return res.status(400).json({
      message: "Invoice number, client name, and amount are required",
    });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({
      message: "Amount must be a valid positive number",
    });
  }

  const allowedCurrencies = ["USD", "EUR", "CHF"];
  if (currency && !allowedCurrencies.includes(currency)) {
    return res.status(400).json({
      message: "Invalid currency",
    });
  }

  if (dueDate && isNaN(Date.parse(dueDate))) {
    return res.status(400).json({
      message: "Invalid due date",
    });
  }

  next(); 
};

module.exports = validateInvoice;
