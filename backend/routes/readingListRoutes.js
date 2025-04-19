const express = require('express');
const { addToReadingList, getReadingListByUsername, updateProgress, removeFromReadingList } = require('../controllers/readingList');
const router = express.Router();

router.post('/add-to-reading-list', addToReadingList);
router.get('/get-reading-list/:username', getReadingListByUsername);
router.put('/update-progress', updateProgress);
router.delete('/remove', removeFromReadingList);

module.exports = router;