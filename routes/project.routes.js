const express = require("express");
const router = express.Router();

const {
  getProjects,
  createProject,
  getProjectCount,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const validateProject = require("../middleware/validateProject.middleware");
const { route } = require("./client.routes");

router.get("/", getProjects);

router.get("/count", getProjectCount)

router.post("/", validateProject, createProject);
router.put("/:id", validateProject, updateProject)
router.delete("/:id",deleteProject)
 

module.exports = router;
