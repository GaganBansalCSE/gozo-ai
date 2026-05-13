const express = require("express");
const jobsController = require("../controllers/jobs.controller");

const router = express.Router();

router.get("/", jobsController.getJobs);
router.get("/top-matches", jobsController.getTopMatches);
router.post("/discover", jobsController.discoverJobs);

module.exports = router;
