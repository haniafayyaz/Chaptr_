const express = require('express');
const router = express.Router();
const clubController = require('../controllers/bookClub'); // Fixed import

// Routes for /api/clubs
router.get('/', clubController.getClubs);
router.get('/:clubId', clubController.getClub);
router.post('/', clubController.uploadCoverImage, clubController.createClub); // Include multer middleware
router.post('/:clubId/join', clubController.joinClub); // New route
router.get('/:clubId/posts', clubController.getPosts);
router.post('/:clubId/posts', clubController.createPost);


module.exports = router;