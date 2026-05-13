const axios = require("axios");
const logger = require("../../../utils/logger");

function toBoardApi(board) {
  return `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
}

async function discoverGreenhouseJobs() {
  const boards = (process.env.GREENHOUSE_BOARDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (boards.length === 0) {
    logger.info("Greenhouse discovery skipped: no GREENHOUSE_BOARDS configured");
    return [];
  }

  const responses = await Promise.allSettled(
    boards.map((board) => axios.get(toBoardApi(board), { timeout: 10000 }))
  );

  return responses.flatMap((result, index) => {
    if (result.status !== "fulfilled") {
      logger.warn("Greenhouse board fetch failed", {
        board: boards[index],
        error: result.reason.message,
      });
      return [];
    }

    return (result.value.data.jobs || []).map((job) => ({ ...job, _board: boards[index] }));
  });
}

module.exports = { discoverGreenhouseJobs };
