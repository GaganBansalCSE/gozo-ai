const asyncHandler = require("../utils/asyncHandler");
const jobApplicationService = require("../services/jobApplication.service");
const jobSearchService = require("../services/jobSearch.service");

const getJobs = asyncHandler(async (req, res) => {
  const response = await jobApplicationService.listJobs(req.query);
  res.status(200).json({ success: true, ...response });
});

const getTopMatches = asyncHandler(async (req, res) => {
  const items = await jobApplicationService.topMatches(req.query);
  res.status(200).json({ success: true, items });
});

const discoverJobs = asyncHandler(async (req, res) => {
  const result = await jobSearchService.discoverAndScoreJobs({
    dryRun: req.query.dryRun === "true",
  });
  res.status(200).json({ success: true, result });
});

module.exports = {
  getJobs,
  getTopMatches,
  discoverJobs,
};
