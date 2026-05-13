const express = require("express");
const jobsRoutes = require("./jobs.routes");
const applicationsRoutes = require("./applications.routes");
const workflowRoutes = require("./workflow.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "GOZO AI backend is healthy" });
});

router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/workflow", workflowRoutes);

module.exports = router;
