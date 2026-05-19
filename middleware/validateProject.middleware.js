const validateProject = (req, res, next) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({
      message: "Project name is required",
    });
  }

  next(); 
};

module.exports = validateProject;
