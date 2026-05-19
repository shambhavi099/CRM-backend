const { db } = require("../FirebaseAdmin");
const { Timestamp } = require("firebase-admin/firestore");

const getProposals = async (req, res) => {
  try {
    const snapshot = await db
      .collection("proposals")
      .orderBy("createdAt", "desc")
      .get();

    const proposals = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        validUntil: data.validUntil?.toDate
          ? data.validUntil.toDate().toISOString().split("T")[0]
          : data.validUntil,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      };
    });

    res.status(200).json(proposals);
  } catch (error) {
    console.error("Get proposals error:", error);
    res.status(500).json({
      message: "Failed to fetch proposals",
    });
  }
};

const createProposal = async (req, res) => {
  try {
    const {
      proposalTitle,
      clientName,
      description,
      amount,
      currency,
      validUntil,
      deliverables,
      timeline,
      paymentterms,
      condition,
    } = req.body;

    const docRef = await db.collection("proposals").add({
      proposalTitle,
      clientName,
      description: description || "",
      amount: Number(amount),
      currency,
      validUntil: validUntil ? Timestamp.fromDate(new Date(validUntil)) : null,
      deliverables: deliverables || "",
      timeline: timeline || "",
      paymentTerms: paymentterms || "",
      condition: condition || "",
      status: "Draft",
      createdAt: Timestamp.now(),
    });

    res.status(201).json({
      message: "Proposal created successfully",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Create proposal error:", error);
    res.status(500).json({ message: "Failed to create proposal" });
  }
};

const getProposalById = async (req, res) => {
  try {
    const doc = await db.collection("proposals").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proposal" });
  }
};

const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { validUntil, ...rest } = req.body;

    await db
      .collection("proposals")
      .doc(id)
      .update({
        ...rest,
        validUntil: validUntil
          ? Timestamp.fromDate(new Date(validUntil))
          : null,
        updatedAt: Timestamp.now(),
      });

    res.status(200).json({ message: "Proposal updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update proposal" });
  }
};

const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("proposals").doc(id).delete();
    res.status(200).json({ message: "Proposal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete proposal" });
  }
};

module.exports = {
  getProposals,
  createProposal,
  getProposalById,
  updateProposal,
  deleteProposal,
};
