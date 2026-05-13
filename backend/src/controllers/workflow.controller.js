const asyncHandler = require("../utils/asyncHandler");
const workflowService = require("../services/workflow.service");

const runDailyWorkflow = asyncHandler(async (req, res) => {
  const dryRun = req.query.dryRun === "true";
  const result = await workflowService.runDailyWorkflow({ dryRun });
  res.status(200).json({ success: true, result });
});

module.exports = {
  runDailyWorkflow,
};
