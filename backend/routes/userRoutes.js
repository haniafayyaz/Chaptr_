const express = require('express');
const { getUsers, deleteUser } = require('../controllers/usersController');

const router = express.Router();

router.get('/', getUsers);
router.delete('/:id', deleteUser);

module.exports = router;