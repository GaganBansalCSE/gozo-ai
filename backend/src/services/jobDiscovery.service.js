const { discoverLinkedInJobs } = require("./discovery/adapters/linkedin.adapter");
const { discoverGreenhouseJobs } = require("./discovery/adapters/greenhouse.adapter");
const { discoverLeverJobs } = require("./discovery/adapters/lever.adapter");
const { normalizeJobs } = require("./discovery/normalization.service");
const { dedupeJobs } = require("./dedupe.service");

async function discoverJobs() {
  const [linkedin, greenhouse, lever] = await Promise.all([
    discoverLinkedInJobs(),
    discoverGreenhouseJobs(),
    discoverLeverJobs(),
  ]);

  const normalized = normalizeJobs({ linkedin, greenhouse, lever });
  return dedupeJobs(normalized);
}

module.exports = {
  discoverJobs,
};
