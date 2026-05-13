const express = require("express");
const rateLimit = require("express-rate-limit");
const jobsController = require("../controllers/jobs.controller");

const router = express.Router();
const jobsReadRateLimit = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const discoverRateLimit = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.get("/", jobsReadRateLimit, jobsController.getJobs);
router.get("/top-matches", jobsReadRateLimit, jobsController.getTopMatches);
router.post("/discover", discoverRateLimit, jobsController.discoverJobs);

module.exports = router;
