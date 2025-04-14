const express = require('express');
const router = express.Router();
const { fetchBooks, getAllBooks, getBookById, addReview } = require('../controllers/books');

// Route to fetch books from Gutenberg API and store them in the database
router.get('/fetch', fetchBooks);

// Route to get all books from the database
router.get('/', getAllBooks);

// Route to get a single book by ID
router.get('/:id', getBookById);

router.post('/:id/reviews', addReview);

module.exports = router;