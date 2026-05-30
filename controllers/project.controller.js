const { messaging } = require("firebase-admin");
const { db } = require("../FirebaseAdmin");
const logActivity = require("../utils/logActivity");
const sendNotifications = require("../utils/sendNotifications")

const getProjects = async (req, res) => {
  try {
    const snapshot = await db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      clientId,
      startDate,
      endDate,
      description,
      progress,
      progressNotes,
    } = req.body;

    const clientRef = db.collection("clients").doc(clientId);
    const projectRef = db.collection("projects").doc();

    await db.runTransaction(async (transaction) => {
      const clientDoc = await transaction.get(clientRef);

      if (!clientDoc.exists) {
        throw new Error("Client not found");
      }

      transaction.set(projectRef, {
        projectName,
        clientId,
        startDate,
        endDate,
        description,
        progress: Number(progress),
        progressNotes,
        createdAt: new Date(),
      });

      transaction.update(clientRef, {
      projects: (clientDoc.data().projects || 0) + 1,

      assignedProjects: [
        ...(clientDoc.data().assignedProjects || []),
        projectRef.id,
      ],

      updatedAt: new Date(),
    });
    });

    await logActivity("project", `new project ${projectName} created`);
    await sendNotifications(
      "New Project Created",
      `A new project '${projectName}' has been created for client '${clientId}'`,
      "PROJECT_CREATED"
    )

    res.status(201).json({
      id: projectRef.id,
      projectName,
      clientId,
      startDate,
      endDate,
      description,
      progress: Number(progress),
      progressNotes,
      createdAt: new Date()
    });
    // await db.collection("projects").add({
    //   projectName,
    //   clientName: clientName || "",
    //   startDate,
    //   endDate,
    //   description,
    //   progress: Number(progress),
    //   progressNotes,
    //   createdAt: new Date(),
    // });
    // await logActivity(
    //   "project",
    //   `New project ${projectName} created by ${clientName}`,
    // );

    // res.status(201).json({ message: "Project created" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
};


const getProjectCount = async (req, res) => {
  try {
    const snapshot = await db.collection("projects").get();
    res.status(200).json({ total: snapshot.size });
  } catch (error) {
    res.status(500).json({ message: "Failed to get client count" });
  }
};


const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .collection("projects")
      .doc(id)
      .update({
        ...req.body,
        updatedAt: new Date(),
      });

    res.status(200).json({ message: "Project updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update project" });
  }
};

const updateProjectProgress = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      progress,
      progressNotes,
      status
    } = req.body;

    const projectRef = db.collection("projects").doc(id);

    const projectDoc = await projectRef.get();

    const updateProjectProgress = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      progress,
      progressNotes,
      status
    } = req.body;

    const projectRef = db.collection("projects").doc(id);

    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const projectData = projectDoc.data();

    if (
      !projectData.assignedEmployees?.includes(req.user.id)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await projectRef.update({
      progress,
      progressNotes,
      status,
      updatedAt: new Date(),
    });

    console.log(projectData.assignedEmployeeId);
    console.log(req.user.id);

    res.status(200).json({
      message: "Project progress updated",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to update progress",
    });

  }

};

    if (!projectDoc.exists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const projectData = projectDoc.data();

    if (
      projectData.assignedEmployeeId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await projectRef.update({
      progress,
      progressNotes,
      status,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "Project progress updated",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to update progress",
    });

  }

};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectRef = db.collection("projects").doc(id);

    await db.runTransaction(async (transaction) => {
      const projectDoc = await transaction.get(projectRef);

      if (!projectDoc.exists) {
        throw new Error("Project not found");
      }

      const { clientId } = projectDoc.data();
      const clientRef = db.collection("clients").doc(clientId);

      const clientDoc = await transaction.get(clientRef);

      transaction.delete(projectRef);

      transaction.update(clientRef, {
        projects: Math.max((clientDoc.data().projects || 1) - 1, 0),
        updatedAt: new Date(),
      });
    });

    res.status(200).json({ message: "Project deleted & count updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
};

const assignProject = async (req, res) => {
  console.log(req.body);
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const employeeRef = db.collection("employees").doc(employeeId);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const employeeData = employeeDoc.data();

    await db.collection("projects").doc(id).update({
      assignedEmployeeId: employeeId,
      assignedEmployeeName: employeeData.name,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "Project assigned successfully",
    });

    await sendNotifications(
    "Project Assigned",
    `Project is assigned to ${employeeData.name}`,
    "PROJECT_ASSIGNED"
  );

  } catch (err) {
    console.error("Assign project error:", err);

    res.status(500).json({
      message: "Failed to assign project",
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectCount,
  updateProject,
  updateProjectProgress,
  deleteProject,
  assignProject,
};
