const fs = require("fs/promises");
const path = require("path");
const logger = require("../utils/logger");
const { wait } = require("../utils/retry");
const { createLinkedInContext } = require("./playwrightClient");

function jitter(minMs = 600, maxMs = 1600) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return wait(delay);
}

async function ensureLinkedInSession(page, authPath, hasAuth) {
  if (hasAuth) {
    return;
  }

  const email = process.env.LINKEDIN_EMAIL;
  const password = process.env.LINKEDIN_PASSWORD;
  if (!email || !password) {
    const error = new Error("LinkedIn credentials required when auth session is missing");
    error.statusCode = 400;
    throw error;
  }

  await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email|phone/i).first().fill(email);
  await jitter();
  await page.getByLabel(/password/i).first().fill(password);
  await jitter();
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(5000);

  const context = page.context();
  await fs.mkdir(path.dirname(authPath), { recursive: true });
  await context.storageState({ path: authPath });
}

async function applyToJob(page, job, options) {
  await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await jitter();

  const easyApplyBtn = page.getByRole("button", { name: /easy apply/i }).first();
  if (!(await easyApplyBtn.isVisible().catch(() => false))) {
    return { success: false, skipped: true, reason: "Easy Apply not available" };
  }

  await easyApplyBtn.click();
  await jitter();

  const textareaCount = await page.locator("textarea").count();
  if (textareaCount > 1) {
    await page.keyboard.press("Escape");
    return { success: false, skipped: true, reason: "Essay-heavy form skipped" };
  }

  const uploadInput = page.locator('input[type="file"]').first();
  const resumePath = process.env.LINKEDIN_RESUME_PATH;
  if (resumePath && (await uploadInput.count())) {
    await uploadInput.setInputFiles(path.resolve(process.cwd(), resumePath));
    await jitter();
  }

  const submitButton = page.getByRole("button", {
    name: options.submit ? /submit application/i : /review|next/i,
  }).first();

  if (!(await submitButton.isVisible().catch(() => false))) {
    await page.keyboard.press("Escape");
    return { success: false, skipped: true, reason: "Unsafe flow skipped" };
  }

  await submitButton.click();
  await jitter();

  if (!options.submit) {
    await page.keyboard.press("Escape");
    return { success: false, skipped: true, reason: "Dry submit mode enabled" };
  }

  return { success: true, skipped: false, reason: "Submitted successfully" };
}

async function runLinkedInEasyApply(jobs, options = {}) {
  const submit = options.submit ?? process.env.AUTO_APPLY_SUBMIT === "true";
  const maxPerRun = Number(process.env.AUTO_APPLY_MAX_PER_RUN || 10);
  const results = [];

  const { context, authPath, hasAuth } = await createLinkedInContext();
  const page = await context.newPage();

  try {
    await ensureLinkedInSession(page, authPath, hasAuth);

    for (const job of jobs.slice(0, maxPerRun)) {
      try {
        const result = await applyToJob(page, job, { submit });
        results.push({
          id: job._id,
          company: job.company,
          role: job.role,
          ...result,
        });
      } catch (error) {
        const screenshotPath = path.resolve(
          process.cwd(),
          `backend/src/automation/failure-${Date.now()}.png`
        );

        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
        logger.error("LinkedIn apply failed", {
          company: job.company,
          role: job.role,
          error: error.message,
          screenshotPath,
        });

        results.push({
          id: job._id,
          company: job.company,
          role: job.role,
          success: false,
          skipped: true,
          reason: `Automation failed: ${error.message}`,
        });
      }
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }

  return results;
}

module.exports = {
  runLinkedInEasyApply,
};
