const { askLlm } = require("../ai/llmClient");
const { buildMatchingPrompt } = require("../ai/prompts");
const { safeParseAiResponse } = require("../ai/parser");
const { retry } = require("../utils/retry");
const logger = require("../utils/logger");

function normalizeScore(score) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

async function scoreJob(job) {
  const prompt = buildMatchingPrompt(job);
  const result = await retry(
    async () => {
      const raw = await askLlm(prompt);
      return safeParseAiResponse(raw);
    },
    { retries: 2, operation: "score-job" }
  );

  return {
    ...job,
    matchScore: normalizeScore(result.score),
    reason: result.reason,
  };
}

async function scoreJobs(jobs) {
  const scoredJobs = [];

  for (const job of jobs) {
    try {
      const scored = await scoreJob(job);
      scoredJobs.push(scored);
    } catch (error) {
      logger.warn("Falling back to default score due to AI failure", {
        company: job.company,
        role: job.role,
        error: error.message,
      });

      scoredJobs.push({
        ...job,
        matchScore: 0,
        reason: "AI scoring unavailable",
      });
    }
  }

  return scoredJobs;
}

module.exports = {
  scoreJobs,
};
