const express = require("express");
const router = express.Router();

const {
  getProjects,
  createProject,
  getProjectCount,
  updateProject,
  updateProjectProgress,
  deleteProject,
} = require("../controllers/project.controller");
const authMiddleware = require("../middleware/authMiddleware")
const validateProject = require("../middleware/validateProject.middleware");
const roleMiddleware = require("../middleware/roleMiddleware")
const { route } = require("./client.routes");

router.get("/", authMiddleware, getProjects);
router.get("/count", getProjectCount)

router.post("/", validateProject, createProject);
router.put("/:id", validateProject, updateProject)
router.delete("/:id",deleteProject)
router.patch("/progress/:id", authMiddleware, roleMiddleware(["employee"]), updateProjectProgress)
 

module.exports = router;
