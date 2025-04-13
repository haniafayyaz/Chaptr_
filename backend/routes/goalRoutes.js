const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.post('/', goalController.setGoal);
router.get('/:username', goalController.getGoal);
router.put('/update-progress', goalController.updateProgress);

module.exports = router;