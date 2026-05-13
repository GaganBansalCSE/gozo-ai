const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: process.env.PLAYWRIGHT_HEADLESS === "true",
    });
  }

  return browser;
}

async function createLinkedInContext() {
  const activeBrowser = await getBrowser();
  const authPath = process.env.PLAYWRIGHT_AUTH_FILE || "backend/src/automation/auth.json";
  const resolvedAuthPath = path.resolve(process.cwd(), authPath);
  const hasAuth = fs.existsSync(resolvedAuthPath);

  const context = await activeBrowser.newContext(
    hasAuth
      ? {
          storageState: resolvedAuthPath,
        }
      : {}
  );

  return { context, authPath: resolvedAuthPath, hasAuth };
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = {
  createLinkedInContext,
  closeBrowser,
};
