const express = require('express');
const { addToReadingList, getReadingListByUsername, updateProgress } = require('../controllers/readingList');
const router = express.Router();

router.post('/add-to-reading-list', addToReadingList);
router.get('/get-reading-list/:username', getReadingListByUsername);
router.put('/update-progress', updateProgress);

module.exports = router;