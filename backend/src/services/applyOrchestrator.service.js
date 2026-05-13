const { runLinkedInEasyApply } = require("../automation/linkedinEasyApply");
const repository = require("../repositories/jobApplication.repository");

async function runEasyApplyWorkflow() {
  if (process.env.AUTO_APPLY_ENABLED !== "true") {
    return { attempted: 0, applied: 0, skipped: 0, disabled: true };
  }

  const candidates = await repository.findTopMatches(
    Number(process.env.AUTO_APPLY_MAX_PER_RUN || 10),
    Number(process.env.MIN_MATCH_SCORE || 65)
  );

  const easyApplyCandidates = candidates.filter(
    (item) => item.applyType === "EASY_APPLY" && item.status === "NOT_APPLIED"
  );

  const results = await runLinkedInEasyApply(easyApplyCandidates);

  let applied = 0;
  let skipped = 0;

  for (const result of results) {
    if (result.success) {
      applied += 1;
      await repository.updateStatus(result.id, "APPLIED");
    } else {
      skipped += 1;
      await repository.updateStatus(result.id, "SKIPPED");
    }
  }

  return {
    attempted: results.length,
    applied,
    skipped,
    disabled: false,
  };
}

module.exports = {
  runEasyApplyWorkflow,
};
