const { db, admin } = require("../FirebaseAdmin");
const logActivity = require("../utils/logActivity");
const sendNotifications = require("../utils/sendNotifications");
const {emailExists} = require("../utils/emailExists")
const { getProjectsByIds } = require("../utils/projectHelper");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const getClientProfile = async (req, res) => {

  try {

    const clientDoc = await db
      .collection("clients")
      .doc(req.user.id)
      .get();

    if (!clientDoc.exists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }
    
    const clientData = clientDoc.data();
    delete clientData.password;

    const projects = await getProjectsByIds(
      clientData.assignedProjects
    );

   res.status(200).json({
      id: clientDoc.id,
      ...clientData,
      projectsData: projects.filter(Boolean),
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch profile",
    });

  }

};

const getClientProjects = async (req, res) => {
  try {
    const clientDoc = await db
      .collection("clients")
      .doc(req.user.id)
      .get();

    if (!clientDoc.exists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const clientData = clientDoc.data();

    const projects = await getProjectsByIds(
      clientData.assignedProjects || []
    );

    for (const project of projects) {
      const teamMembers = [];

      for (const empId of project.assignedEmployees || []) {
        const empSnap = await db
          .collection("employees")
          .doc(empId)
          .get();

        if (!empSnap.exists) continue;

        const empData = empSnap.data();

        teamMembers.push({
          id: empSnap.id,
          name: empData.name,
          role: empData.role,
        });
      }

      project.teamMembers = teamMembers;
    }

    res.status(200).json(projects);

  } catch (error) {
    console.error("Get client projects error:", error);

    res.status(500).json({
      message: "Failed to fetch client projects",
    });
  }
};

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
  const { name, email, company, phone,password } = req.body;
  if (await emailExists(email)) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }
    const hashedPassword = await bcrypt.hash(password, 10);
  const docRef = await db.collection("clients").add({
    name,
    email,
    company,
    phone,
    password:hashedPassword,
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
  getClientProfile,
  getClientProjects,
  getClients,
  createClient,
  getClientCount,
  updateClient,
  deleteClient,
};
