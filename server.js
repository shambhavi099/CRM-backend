const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientRoutes = require("./routes/client.routes");
const projectRoutes = require("./routes/project.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const proposalRoutes = require("./routes/proposal.routes");
const employeeRoutes = require("./routes/employees.routes");
const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationsRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});