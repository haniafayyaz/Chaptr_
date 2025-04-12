const express = require('express');
const router = express.Router();
const clubController = require('../controllers/bookClub'); // Fixed import

// Routes for /api/clubs
router.get('/', clubController.getClubs);
router.post('/', clubController.uploadCoverImage, clubController.createClub); // Include multer middleware


module.exports = router;