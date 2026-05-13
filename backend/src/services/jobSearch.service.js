const logger = require("../utils/logger");
const jobDiscoveryService = require("./jobDiscovery.service");
const matchingService = require("./matching.service");
const jobApplicationService = require("./jobApplication.service");

async function discoverAndScoreJobs(options = {}) {
  const { dryRun = false } = options;
  const discoveredJobs = await jobDiscoveryService.discoverJobs();
  const scoredJobs = await matchingService.scoreJobs(discoveredJobs);

  if (!dryRun) {
    await jobApplicationService.upsertMany(scoredJobs);
  }

  logger.info("Discovery workflow completed", {
    discovered: discoveredJobs.length,
    scored: scoredJobs.length,
    persisted: dryRun ? 0 : scoredJobs.length,
    dryRun,
  });

  return {
    discoveredCount: discoveredJobs.length,
    scoredCount: scoredJobs.length,
    persistedCount: dryRun ? 0 : scoredJobs.length,
    jobs: scoredJobs,
  };
}

module.exports = {
  discoverAndScoreJobs,
};
