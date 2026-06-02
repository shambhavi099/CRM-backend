const express = require("express");
const router = express.Router();

const {
  getEmployeeProfile,
  getEmployees,
  getEmployeesCount,
 // updateEmployee,
  deleteEmployee,
  createEmployee,
  getAvailableProjects,
  assignProjectToEmployee,
  getEmployeeProjects,
  removeProjectFromEmployee, 
  getEmployeeProjectsAll,
  updateEmployeeProfile
} = require("../controllers/employees.controller");

const validateEmployee = require("../middleware/validateEmployee.middleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Employee CRUD Routes
router.get("/", getEmployees);
router.get("/count", getEmployeesCount);
router.post("/", validateEmployee, createEmployee);
//router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

router.get("/profile", authMiddleware, roleMiddleware(["employee"]), getEmployeeProfile)


// Project Routes
router.get("/available-projects", getAvailableProjects);
router.post("/assign-project", assignProjectToEmployee);
router.get("/projects", authMiddleware, getEmployeeProjects);
router.get("/:id/projects", authMiddleware, getEmployeeProjectsAll);
router.put("/profile", authMiddleware, updateEmployeeProfile)

// Remove Assigned Project
router.post("/remove-project", removeProjectFromEmployee); 
module.exports = router;