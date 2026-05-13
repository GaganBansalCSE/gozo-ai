require("dotenv").config();

const app = require("./app");
const { connectMongoDB } = require("./db/mongoose");
const { startDailyJobSync } = require("./scheduler/dailyJobSync");
const workflowService = require("./services/workflow.service");
const logger = require("./utils/logger");

const port = Number(process.env.PORT || 4000);

async function startServer() {
  await connectMongoDB();

  app.listen(port, () => {
    logger.info("Backend server started", {
      port,
      env: process.env.NODE_ENV || "development",
    });
  });

  startDailyJobSync(workflowService.runDailyWorkflow);
}

startServer().catch((error) => {
  logger.error("Failed to start server", { error: error.message, stack: error.stack });
  process.exit(1);
});
