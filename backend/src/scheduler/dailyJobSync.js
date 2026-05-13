const cron = require("node-cron");
const logger = require("../utils/logger");

function startDailyJobSync(runWorkflow) {
  const schedule = process.env.DAILY_CRON || "0 9 * * *";

  if (!cron.validate(schedule)) {
    throw new Error(`Invalid DAILY_CRON expression: ${schedule}`);
  }

  cron.schedule(schedule, async () => {
    logger.info("Scheduled workflow trigger started", { schedule });
    try {
      await runWorkflow({ dryRun: false });
      logger.info("Scheduled workflow trigger completed", { schedule });
    } catch (error) {
      logger.error("Scheduled workflow trigger failed", {
        schedule,
        error: error.message,
      });
    }
  });

  logger.info("Daily scheduler initialized", { schedule });
}

module.exports = { startDailyJobSync };
