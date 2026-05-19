const { db, admin } = require("../FirebaseAdmin");
const logActivity = require("../utils/logActivity");
const sendNotifications = require("../utils/sendNotifications")

const getClients = async (req, res) => {
  try {
    const snapshot = await db
      .collection("clients")
      .orderBy("createdAt", "desc")
      .get();

    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({
      message: "Failed to fetch clients",
    });
  }
};

const createClient = async (req, res) => {
  const { name, email, company, phone } = req.body;

  const docRef = await db.collection("clients").add({
    name,
    email,
    company,
    phone,
    projects: 0,
    createdAt: new Date(),
  });
  logActivity("client", `New client "${name}" added`);

  await sendNotifications(
    "New Client Added",
    `A new client '${name}' has been added`,
    "CLIENT_ADDED"
  )

  res.status(201).json({
    id: docRef.id,
    name,
    email,
    company,
    phone,
  });
};

const getClientCount = async (req, res) => {
  try {
    const snapshot = await db.collection("clients").count().get();
    res.status(200).json({ total: snapshot.data().count });
  } catch (error) {
    res.status(500).json({ message: "Failed to get client count" });
  }
};
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .collection("clients")
      .doc(id)
      .update({
        ...req.body,
        updatedAt: new Date(),
      });

    res.status(200).json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ message: "Failed to update client" });
  }
};
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("clients").doc(id).delete();
    res.status(200).json({ message: "client deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete client" });
  }
};
module.exports = {
  getClients,
  createClient,
  getClientCount,
  updateClient,
  deleteClient,
};
