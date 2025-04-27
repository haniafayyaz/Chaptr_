const express = require('express');
const router = express.Router();
const {
  createReadingChallenge,
  getAllChallenges,
  getEnrolledChallenges,
  enrollInChallenge,
  updateChallengeProgress,
} = require('../controllers/readingChallengeController');

// Create a new reading challenge
router.post('/', createReadingChallenge);

// Get all reading challenges
router.get('/', getAllChallenges);

// Get enrolled challenges for a user
router.get('/enrolled/:username', getEnrolledChallenges);

// Enroll in a challenge
router.post('/enroll', enrollInChallenge);

// Update challenge progress
router.put('/update-progress', updateChallengeProgress);

module.exports = router;