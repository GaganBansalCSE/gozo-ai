const mongoose = require("mongoose");
const JobApplication = require("../models/JobApplication");

function normalizeDuplicateKey(job) {
  return {
    company: job.company,
    role: job.role,
    url: job.url,
  };
}

async function upsertJob(job) {
  const filter = {
    company: job.company,
    role: job.role,
    url: job.url,
  };

  try {
    return await JobApplication.findOneAndUpdate(
      filter,
      {
        $set: {
          location: job.location,
          source: job.source,
          applyType: job.applyType,
          matchScore: job.matchScore,
          reason: job.reason,
          status: job.status || "NOT_APPLIED",
          postedAt: job.postedAt,
          appliedAt: job.appliedAt || null,
          techStack: job.techStack || [],
          metadata: job.metadata || {},
        },
        $setOnInsert: {
          company: job.company,
          role: job.role,
          url: job.url,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      return JobApplication.findOneAndUpdate(
        normalizeDuplicateKey(job),
        { $set: job },
        { new: true }
      );
    }
    throw error;
  }
}

async function findJobs(filters, pagination) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    JobApplication.find(filters)
      .sort({ matchScore: -1, postedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JobApplication.countDocuments(filters),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

function findTopMatches(limit = 20, minScore = 70) {
  return JobApplication.find({ matchScore: { $gte: minScore } })
    .sort({ matchScore: -1, postedAt: -1 })
    .limit(limit)
    .lean();
}

function validateObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid application id");
    error.statusCode = 400;
    throw error;
  }
}

async function updateStatus(id, status) {
  validateObjectId(id);

  const update = { status };
  if (status === "APPLIED") {
    update.appliedAt = new Date();
  }

  const application = await JobApplication.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return application;
}

function markApplied(id) {
  return updateStatus(id, "APPLIED");
}

module.exports = {
  upsertJob,
  findJobs,
  findTopMatches,
  updateStatus,
  markApplied,
};
