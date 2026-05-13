const {
  sanitizeText,
  normalizeTechStack,
  inferApplyType,
} = require("./parsers/common.parser");

function normalizeLinkedInJob(job) {
  const description = sanitizeText(job.description || job.summary || "");
  const url = sanitizeText(job.url || job.applyUrl || "");

  if (!url) {
    return null;
  }

  return {
    company: sanitizeText(job.company || job.companyName || "Unknown Company", "Unknown Company"),
    role: sanitizeText(job.title || job.role || "Unknown Role", "Unknown Role"),
    location: sanitizeText(job.location || "Unknown", "Unknown"),
    source: "LINKEDIN",
    applyType: inferApplyType("LINKEDIN", url),
    matchScore: 0,
    reason: "Pending AI scoring",
    url,
    postedAt: job.postedAt ? new Date(job.postedAt) : null,
    techStack: normalizeTechStack(description),
    metadata: {
      rawSource: "linkedin",
      sourceUrl: job._sourceUrl,
      description,
    },
  };
}

function normalizeGreenhouseJob(job) {
  const description = sanitizeText(job.content || "");
  const url = sanitizeText(job.absolute_url || "");

  if (!url) {
    return null;
  }

  return {
    company: sanitizeText(job.company_name || job._board || "Unknown Company", "Unknown Company"),
    role: sanitizeText(job.title || "Unknown Role", "Unknown Role"),
    location: sanitizeText(job.location?.name || "Unknown", "Unknown"),
    source: "GREENHOUSE",
    applyType: "MANUAL",
    matchScore: 0,
    reason: "Pending AI scoring",
    url,
    postedAt: job.updated_at ? new Date(job.updated_at) : null,
    techStack: normalizeTechStack(description),
    metadata: {
      rawSource: "greenhouse",
      board: job._board,
      description,
    },
  };
}

function normalizeLeverJob(job) {
  const description = sanitizeText(job.text || "");
  const url = sanitizeText(job.hostedUrl || "");

  if (!url) {
    return null;
  }

  return {
    company: sanitizeText(job.categories?.team || job._companyHandle || "Unknown Company", "Unknown Company"),
    role: sanitizeText(job.text || "Unknown Role", "Unknown Role"),
    location: sanitizeText(job.categories?.location || "Unknown", "Unknown"),
    source: "LEVER",
    applyType: "MANUAL",
    matchScore: 0,
    reason: "Pending AI scoring",
    url,
    postedAt: job.createdAt ? new Date(job.createdAt) : null,
    techStack: normalizeTechStack(description),
    metadata: {
      rawSource: "lever",
      companyHandle: job._companyHandle,
      description,
    },
  };
}

function normalizeJobs(payload) {
  return [
    ...(payload.linkedin || []).map(normalizeLinkedInJob),
    ...(payload.greenhouse || []).map(normalizeGreenhouseJob),
    ...(payload.lever || []).map(normalizeLeverJob),
  ].filter(Boolean);
}

module.exports = {
  normalizeJobs,
};
