const SOURCES = Object.freeze([
  "LINKEDIN",
  "GREENHOUSE",
  "LEVER",
  "CAREERS_PAGE",
]);

const APPLY_TYPES = Object.freeze(["EASY_APPLY", "MANUAL"]);

const APPLICATION_STATUSES = Object.freeze([
  "NOT_APPLIED",
  "APPLIED",
  "INTERVIEW",
  "REJECTED",
  "SKIPPED",
]);

const AI_PROVIDERS = Object.freeze(["openai", "gemini"]);

module.exports = {
  SOURCES,
  APPLY_TYPES,
  APPLICATION_STATUSES,
  AI_PROVIDERS,
};
