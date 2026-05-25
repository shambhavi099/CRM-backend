const express = require("express");
const router = express.Router();

const {
  employeeLogin,
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
} = require("../controllers/employees.controller");

const validateEmployee = require("../middleware/validateEmployee.middleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Employee CRUD Routes
router.get("/", getEmployees);
router.get("/count", getEmployeesCount);
router.post("/", validateEmployee, createEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

router.post("/login", employeeLogin);
router.get("/profile", authMiddleware, roleMiddleware(["employee"]), getEmployeeProfile)

// Project Routes
router.get("/available-projects", getAvailableProjects);
router.post("/assign-project", assignProjectToEmployee);
router.get("/:id/projects", getEmployeeProjects);

// Remove Assigned Project
router.post("/remove-project", removeProjectFromEmployee); 
module.exports = router;