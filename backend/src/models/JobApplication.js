const mongoose = require("mongoose");
const {
  SOURCES,
  APPLY_TYPES,
  APPLICATION_STATUSES,
} = require("../utils/constants");

const { Schema } = mongoose;

const JobApplicationSchema = new Schema(
  {
    company: { type: String, required: true, trim: true, index: true },
    role: { type: String, required: true, trim: true, index: true },
    location: { type: String, default: "Unknown", trim: true, index: true },
    source: { type: String, enum: SOURCES, required: true, index: true },
    applyType: { type: String, enum: APPLY_TYPES, required: true, index: true },
    matchScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    reason: { type: String, default: "" },
    url: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "NOT_APPLIED",
      index: true,
    },
    postedAt: { type: Date },
    appliedAt: { type: Date, default: null },
    techStack: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

JobApplicationSchema.index({ company: 1, role: 1, url: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
