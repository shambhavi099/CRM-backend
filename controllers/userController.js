const { db, admin } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");

const createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").add({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "manager",
      isActive: "true",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Manager created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create manager" });
  }
};

/*const createClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .collection("clients")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("clients").add({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "client",
      isActive: "true",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Client created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create manager" });
  }
};*/

const getManagers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const managers = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : null,
      };
      
    });

    res.status(200).json(managers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};

const deleteManager = async (req, res) => {
  try {
    await db.collection("users").doc(req.params.id).delete();
    res.json({ message: "Manager deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete manager" });
  }
};

module.exports = {
  createManager,
  //createClient,
  getManagers,
  deleteManager,
};