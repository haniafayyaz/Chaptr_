// routes/index.js (or wherever your routes are defined)
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/bookClub');

router.get('/', clubController.getClubs);
router.post('/clubs', clubController.createClub);

module.exports = router;