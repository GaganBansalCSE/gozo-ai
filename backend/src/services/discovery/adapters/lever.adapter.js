const axios = require("axios");
const logger = require("../../../utils/logger");

function toLeverApi(company) {
  return `https://api.lever.co/v0/postings/${company}?mode=json`;
}

async function discoverLeverJobs() {
  const companies = (process.env.LEVER_COMPANIES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (companies.length === 0) {
    logger.info("Lever discovery skipped: no LEVER_COMPANIES configured");
    return [];
  }

  const responses = await Promise.allSettled(
    companies.map((company) => axios.get(toLeverApi(company), { timeout: 10000 }))
  );

  return responses.flatMap((result, index) => {
    if (result.status !== "fulfilled") {
      logger.warn("Lever company fetch failed", {
        company: companies[index],
        error: result.reason.message,
      });
      return [];
    }

    return (result.value.data || []).map((job) => ({ ...job, _companyHandle: companies[index] }));
  });
}

module.exports = { discoverLeverJobs };
