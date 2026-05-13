const repository = require("../repositories/jobApplication.repository");
const { APPLICATION_STATUSES, SOURCES, APPLY_TYPES } = require("../utils/constants");

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildFilters(query) {
  const filters = {};

  if (query.status) {
    if (!APPLICATION_STATUSES.includes(query.status)) {
      const error = new Error("Invalid status filter");
      error.statusCode = 400;
      throw error;
    }
    filters.status = query.status;
  }

  if (query.source) {
    if (!SOURCES.includes(query.source)) {
      const error = new Error("Invalid source filter");
      error.statusCode = 400;
      throw error;
    }
    filters.source = query.source;
  }

  if (query.applyType) {
    if (!APPLY_TYPES.includes(query.applyType)) {
      const error = new Error("Invalid applyType filter");
      error.statusCode = 400;
      throw error;
    }
    filters.applyType = query.applyType;
  }

  if (query.location) {
    filters.location = { $regex: query.location, $options: "i" };
  }

  if (query.role) {
    filters.role = { $regex: query.role, $options: "i" };
  }

  const minScore = parseNumber(query.minScore, undefined);
  const maxScore = parseNumber(query.maxScore, undefined);
  if (Number.isFinite(minScore) || Number.isFinite(maxScore)) {
    filters.matchScore = {};
    if (Number.isFinite(minScore)) {
      filters.matchScore.$gte = minScore;
    }
    if (Number.isFinite(maxScore)) {
      filters.matchScore.$lte = maxScore;
    }
  }

  return filters;
}

async function listJobs(query) {
  const page = Math.max(parseNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(parseNumber(query.limit, 20), 1), 100);
  return repository.findJobs(buildFilters(query), { page, limit });
}

function topMatches(query) {
  const limit = Math.min(Math.max(parseNumber(query.limit, 10), 1), 50);
  const minScore = Math.min(Math.max(parseNumber(query.minScore, 70), 0), 100);
  return repository.findTopMatches(limit, minScore);
}

function changeStatus(id, status) {
  if (!APPLICATION_STATUSES.includes(status)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  return repository.updateStatus(id, status);
}

function markApplied(id) {
  return repository.markApplied(id);
}

function upsertMany(jobs) {
  return Promise.all(jobs.map((job) => repository.upsertJob(job)));
}

module.exports = {
  listJobs,
  topMatches,
  changeStatus,
  markApplied,
  upsertMany,
};
