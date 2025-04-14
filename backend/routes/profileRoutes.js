const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');

// Get user profile
router.get('/:username', getProfile);

// Update user profile
router.put('/update', updateProfile);

// Upload profile picture
router.post('/upload-picture', uploadProfilePicture);

module.exports = router;