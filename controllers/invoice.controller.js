const { db } = require("../FirebaseAdmin");
const logActivity = require("../utils/logActivity");

const getInvoices = async (req, res) => {
  try {
    const snapshot = await db
      .collection("invoices")
      .orderBy("createdAt", "desc")
      .get();

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      clientName,
      description,
      amount,
      currency,
      dueDate,
      notes,
    } = req.body;

    await db.collection("invoices").add({
      invoiceNumber,
      clientName,
      description,
      amount: Number(amount),
      currency,
      dueDate,
      notes,
      paid: false,
      createdAt: new Date(),
    });
    await logActivity("invoice", `Invoice  ${invoiceNumber} created`);

    res.status(201).json({ message: "Invoice created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .collection("invoices")
      .doc(id)
      .update({
        ...req.body,
        updatedAt: new Date(),
      });

    const updatedDoc = await db.collection("invoices").doc(id).get();

    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update invoice" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("invoices").doc(id).delete();

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ message: "Failed to delete invoice" });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
