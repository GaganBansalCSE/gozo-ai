const express = require("express");
const workflowController = require("../controllers/workflow.controller");

const router = express.Router();

router.post("/run-daily", workflowController.runDailyWorkflow);

module.exports = router;
