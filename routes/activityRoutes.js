const express = require("express");
const router = express.Router();
const { db } = require("../FirebaseAdmin");

router.get("/recent", async (req, res) => {
  try {
    const snapshot = await db
      .collection("activities")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

module.exports = router;
