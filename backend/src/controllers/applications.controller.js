const asyncHandler = require("../utils/asyncHandler");
const jobApplicationService = require("../services/jobApplication.service");

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = await jobApplicationService.changeStatus(id, status);
  res.status(200).json({ success: true, item });
});

const markApplied = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await jobApplicationService.markApplied(id);
  res.status(200).json({ success: true, item });
});

module.exports = {
  updateApplicationStatus,
  markApplied,
};
