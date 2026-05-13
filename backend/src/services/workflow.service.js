const logger = require("../utils/logger");
const jobSearchService = require("./jobSearch.service");
const applyOrchestratorService = require("./applyOrchestrator.service");

async function runDailyWorkflow(options = {}) {
  const workflowRunId = `run_${Date.now()}`;
  const dryRun = Boolean(options.dryRun);

  logger.info("Daily workflow started", { workflowRunId, dryRun });
  const discovery = await jobSearchService.discoverAndScoreJobs({ dryRun });

  let autoApply = { attempted: 0, applied: 0, skipped: 0, disabled: true };
  if (!dryRun) {
    autoApply = await applyOrchestratorService.runEasyApplyWorkflow();
  }

  const summary = {
    workflowRunId,
    dryRun,
    fetched: discovery.discoveredCount,
    deduped: discovery.scoredCount,
    scored: discovery.scoredCount,
    persisted: discovery.persistedCount,
    autoApply,
  };

  logger.info("Daily workflow completed", summary);
  return summary;
}

module.exports = {
  runDailyWorkflow,
};
