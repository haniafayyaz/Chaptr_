const express = require('express');
<<<<<<< HEAD
const { addToReadingList, getReadingListByUsername, updateProgress, removeFromReadingList} = require('../controllers/readingList');
=======
const { addToReadingList, getReadingListByUsername, updateProgress, removeFromReadingList } = require('../controllers/readingList');
>>>>>>> 48aab55 (book club frontend)
const router = express.Router();

router.post('/add-to-reading-list', addToReadingList);
router.get('/get-reading-list/:username', getReadingListByUsername);
router.put('/update-progress', updateProgress);
router.delete('/remove', removeFromReadingList);

module.exports = router;