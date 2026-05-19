const express = require("express");
const router = express.Router();

const {
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

// Employee CRUD Routes
router.get("/", getEmployees);
router.get("/count", getEmployeesCount);
router.post("/", validateEmployee, createEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

// Project Routes
router.get("/available-projects", getAvailableProjects);
router.post("/assign-project", assignProjectToEmployee);
router.get("/:id/projects", getEmployeeProjects);

// Remove Assigned Project
router.post("/remove-project", removeProjectFromEmployee); 
module.exports = router;