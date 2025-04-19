const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

router.get("/releases", calendarController.getReleases);

module.exports = router;