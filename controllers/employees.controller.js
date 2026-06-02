const { db } = require("../FirebaseAdmin");
const sendNotifications = require("../utils/sendNotifications")
const { getProjectsByIds } = require("../utils/projectHelper");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const getEmployees = async (req, res) => {
  try {
    const snapshot = await db
      .collection("employees")
      .orderBy("createdAt", "desc")
      .get();

    const employees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
};

const createEmployee = async (req, res) => {
  const {
    name,
    number,
    email,
    DOB,
    password,
    pastCompany,
    role,
    salary,
    timeServed,
    portfolio,
    resume,
    aadhar,
    pan,
    empId,
    pfAccount,
    accountNumber,
    salaryAccount,
    hobby,
    futurePlans,
    emergencyContact,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10)

  const docRef = await db.collection("employees").add({
    name,
    number,
    email,
    DOB,
    password:hashedPassword,
    pastCompany,
    role,
    userRole:"employee",
    salary,
    timeServed,
    portfolio,
    resume,
    aadhar,
    pan,
    empId,
    pfAccount,
    accountNumber,
    salaryAccount,
    hobby,
    futurePlans,
    emergencyContact,
    createdAt: new Date(),
  });

  res.status(201).json({
    id: docRef.id,
    name,
    number,
    email,
    DOB,
    pastCompany,
    role,
    salary,
    timeServed,
    portfolio,
    resume,
    aadhar,
    pan,
    empId,
    pfAccount,
    accountNumber,
    salaryAccount,
    hobby,
    futurePlans,
    emergencyContact,
  });
};

const getEmployeeProfile = async (req, res) => {

  try {

    const employeeDoc = await db
      .collection("employees")
      .doc(req.user.id)
      .get();

    if (!employeeDoc.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const employeeData = employeeDoc.data();

    delete employeeData.password;

    // assigned projects
    const assignedProjects =
      employeeData.assignedProjects || [];

    const projects = [];

    for (const projectId of assignedProjects) {

      const projectSnap = await db
        .collection("projects")
        .doc(projectId)
        .get();

      if (projectSnap.exists) {

        const projectData = projectSnap.data();

        const assignedEmployees =
          projectData.assignedEmployees || [];

        const teammates = [];

        for (const empId of assignedEmployees) {

          // skip logged in employee
          if (empId === req.user.id) continue;

          const empSnap = await db
            .collection("employees")
            .doc(empId)
            .get();

          if (empSnap.exists) {

            const empData = empSnap.data();

            teammates.push({
              id: empSnap.id,
              name: empData.name,
              role: empData.role,
            });
          }
        }

        projects.push({
          id: projectSnap.id,
          ...projectData,
          teammates,
        });
      }
    }

    res.status(200).json({
      id: employeeDoc.id,
      ...employeeData,
      projects,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch profile",
    });

  }
};

const getEmployeesCount = async (req, res) => {
  try {
    const snapshot = await db.collection("employees").count().get();

    res.status(200).json({ total: snapshot.data().count });
  } catch (error) {
    res.status(500).json({ message: "Failed to get employees count" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("employees").doc(id).update({
      ...req.body,
      updatedAt: new Date(),
    });

    res.status(200).json({
      id,
      ...req.body,
      updatedAt: new Date(),
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update employee" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("employees").doc(id).delete();
    res.status(200).json({ message: "employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
};

const getAvailableProjects = async (req, res) => {
  try {
    const snapshot = await db.collection("projects").get();

    const projects = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (project) =>
          (project.status || "").toLowerCase() !== "completed"
      );

    res.status(200).json(projects);
  } catch (error) {
    console.error("Get available projects error:", error);
    res.status(500).json({
      message: "Failed to fetch available projects",
    });
  }
};

const assignProjectToEmployee = async (req, res) => {
  try {
    const { employeeId, projectId } = req.body;

    if (!employeeId || !projectId) {
      return res.status(400).json({
        message: "employeeId and projectId are required",
      });
    }

    const employeeRef = db.collection("employees").doc(employeeId);
    const projectRef = db.collection("projects").doc(projectId);

    const [employeeSnap, projectSnap] = await Promise.all([
      employeeRef.get(),
      projectRef.get(),
    ]);

    if (!employeeSnap.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (!projectSnap.exists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const employeeData = employeeSnap.data();
    const projectData = projectSnap.data();

    const assignedProjects =
      employeeData.assignedProjects || [];

    // Already assigned check
    if (assignedProjects.includes(projectId)) {
      return res.status(400).json({
        message:
          "Project already assigned to this employee.",
      });
    }

    // Update employee
    await employeeRef.update({
      assignedProjects: [
        ...assignedProjects,
        projectId,
      ],
      updatedAt: new Date(),
    });


    // Update project
    const assignedEmployees =
      projectData.assignedEmployees || [];
      
    if (!assignedEmployees.includes(employeeId)) {
      await projectRef.update({
        assignedEmployees: [
          ...assignedEmployees,
          employeeId,
        ],
        updatedAt: new Date(),
      });
    }

    await sendNotifications(
      'Project Assigned Sucessfully',
      `This ${projectData.projectName}' is assigned to '${employeeData.name}'`,
      'PROJECT_ASSIGNED'
    )

    res.status(200).json({
      message: "Project assigned successfully",
    });
  } catch (error) {
    console.error(
      "Assign project to employee error:",
      error
    );
    res.status(500).json({
      message: "Failed to assign project",
    });
  }
};

const getEmployeeProjects = async (req, res) => {
  try {

    const employeeSnap = await db
      .collection("employees")
      .doc(req.user.id)
      .get();

    if (!employeeSnap.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const employeeData = employeeSnap.data();
    const assignedProjects =
    employeeData.assignedProjects || [];

    const projects = await getProjectsByIds(
     assignedProjects
   );

   //fetch team mates

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
  } 
  catch (error) {
    console.error(
      "Get employee projects error:",
      error
    );
    res.status(500).json({
      message:
        "Failed to fetch employee assigned projects",
    });
  }
};

const removeProjectFromEmployee = async (req, res) => {
  try {
    const { employeeId, projectId } = req.body;

    if (!employeeId || !projectId) {
      return res.status(400).json({
        message: "employeeId and projectId are required",
      });
    }

    const employeeRef = db.collection("employees").doc(employeeId);
    const projectRef = db.collection("projects").doc(projectId);

    const [employeeSnap, projectSnap] = await Promise.all([
      employeeRef.get(),
      projectRef.get(),
    ]);

    if (!employeeSnap.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (!projectSnap.exists) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const employeeData = employeeSnap.data();
    const projectData = projectSnap.data();

    // Remove project from employee
    const updatedProjects =
      (employeeData.assignedProjects || []).filter(
        (id) => id !== projectId
      );

    await employeeRef.update({
      assignedProjects: updatedProjects,
      updatedAt: new Date(),
    });

    // Remove employee from project
    const updatedEmployees =
      (projectData.assignedEmployees || []).filter(
        (id) => id !== employeeId
      );

    await projectRef.update({
      assignedEmployees: updatedEmployees,
      updatedAt: new Date(),
    });

      await sendNotifications(
      "Project Removed",
      `Project '${projectData.projectName}' has been removed from employee '${employeeData.name}'`,
      "PROJECT_REMOVED"
    );

    res.status(200).json({
      message: "Project removed successfully.",
    });
  } catch (error) {
    console.error("Remove project error:", error);
    res.status(500).json({
      message: "Failed to remove project",
    });
  }
};

const getEmployeeProjectsAll = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeSnap = await db
      .collection("employees")
      .doc(id)
      .get();

    if (!employeeSnap.exists) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const employeeData = employeeSnap.data();
    const assignedProjects =
    employeeData.assignedProjects || [];

    const projects = [];

    for (const projectId of assignedProjects) {
      const projectSnap = await db
        .collection("projects")
        .doc(projectId)
        .get();

      if (projectSnap.exists) {
        projects.push({
          id: projectSnap.id,
          ...projectSnap.data(),
        });
      }
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error(
      "Get employee projects error:",
      error
    );
    res.status(500).json({
      message:
        "Failed to fetch employee assigned projects",
    });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { name, phone, role, email, portfolio, resume } = req.body;

    await db
      .collection("employees")
      .doc(req.user.id)
      .update({
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(role && { role }),
        ...(portfolio &&{ portfolio }),
        ...(resume && { resume }),
        updatedAt: new Date(),
      });

    res.status(200).json({
      message: "Profile updated successfully",
    });

  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};
    

  
module.exports = {
  getEmployeeProfile,
  getEmployees,
  getEmployeesCount,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  getAvailableProjects,
  assignProjectToEmployee,
  getEmployeeProjects,
  removeProjectFromEmployee,
  getEmployeeProjectsAll,
  updateEmployeeProfile
};