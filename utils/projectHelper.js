const { db } = require("../FirebaseAdmin");

const getProjectsByIds = async (projectIds = []) => {
  const projects = await Promise.all(
    projectIds.map(async (projectId) => {
      const projectDoc = await db
        .collection("projects")
        .doc(projectId)
        .get();

      if (!projectDoc.exists) return null;

      return {
        id: projectDoc.id,
        ...projectDoc.data(),
      };
    })
  );

  return projects.filter(Boolean);
};

module.exports = { getProjectsByIds };