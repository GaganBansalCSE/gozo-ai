const axios = require("axios");
const logger = require("../../../utils/logger");

async function discoverLinkedInJobs() {
  const configuredUrls = (process.env.LINKEDIN_SEARCH_URLS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configuredUrls.length === 0) {
    logger.info("LinkedIn discovery skipped: no LINKEDIN_SEARCH_URLS configured");
    return [];
  }

  const responses = await Promise.allSettled(
    configuredUrls.map((url) => axios.get(url, { timeout: 10000 }))
  );

  return responses.flatMap((result, index) => {
    if (result.status !== "fulfilled") {
      logger.warn("LinkedIn source fetch failed", {
        url: configuredUrls[index],
        error: result.reason.message,
      });
      return [];
    }

    const payload = result.value.data;
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.map((item) => ({ ...item, _sourceUrl: configuredUrls[index] }));
  });
}

module.exports = { discoverLinkedInJobs };
