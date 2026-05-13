const logger = require("./logger");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry(fn, options = {}) {
  const {
    retries = 2,
    baseDelayMs = 400,
    maxDelayMs = 3000,
    operation = "operation",
  } = options;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      logger.warn("Retrying failed operation", {
        operation,
        attempt: attempt + 1,
        retries,
        delay,
        error: error.message,
      });
      await wait(delay);
      attempt += 1;
    }
  }

  throw new Error(`Retry unexpectedly exhausted for ${operation}`);
}

module.exports = { retry, wait };
