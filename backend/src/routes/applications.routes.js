const express = require("express");
const applicationsController = require("../controllers/applications.controller");

const router = express.Router();

router.patch("/:id/status", applicationsController.updateApplicationStatus);
router.post("/:id/mark-applied", applicationsController.markApplied);

module.exports = router;
