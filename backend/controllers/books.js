const axios = require('axios');
const Book = require('../models/Books');

// Fetch books from the Gutenberg API and store them in the database
const fetchBooks = async (req, res) => {
  try {
    const booksToSave = [];
    const totalPages = 5; // Set how many pages you want to fetch (each page = ~32 books)

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(`https://gutendex.com/books?page=${page}`);

      if (!response.data || !response.data.results) {
        continue; // Skip if no results on this page
      }

      for (const book of response.data.results) {
        const title = book.title || 'Unknown Title';
        const author = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';

        const existingBook = await Book.findOne({ title, author });
        if (!existingBook) {
          let genre = 'Unknown';
          if (book.bookshelves && book.bookshelves.length > 0) {
            const browsingGenres = book.bookshelves
              .filter((shelf) => shelf.toLowerCase().startsWith('browsing: '))
              .map((shelf) => shelf.replace(/(?:)^Browsing: /i, '').trim());
            genre = browsingGenres.length > 0 ? browsingGenres[0] : 'Unknown';
          }

          booksToSave.push({
            title,
            author,
            genre,
            totalPages: Math.floor(Math.random() * (300 - 200 + 1)) + 200,
            coverImage: book.formats && book.formats['image/jpeg'] ? book.formats['image/jpeg'] : null,
            summary: book.summaries && book.summaries.length > 0 ? book.summaries[0] : 'No summary available',
            averageRating: 0,
          });
        }
      }
    }

    if (booksToSave.length > 0) {
      await Book.insertMany(booksToSave);
    }

    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch (error) {
    console.error('Error in fetchBooks:', error.message);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};


// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in getAllBooks:', error.message);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
};

// Get a book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error in getBookById:', error.message);
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
};

// Add a review to a book
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerName, rating, comment } = req.body;

    // Validate input
    if (!reviewerName || !rating) {
      return res.status(400).json({ message: 'Reviewer name and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Add the new review
    book.reviews.push({
      reviewerName,
      rating,
      comment: comment || '',
      date: new Date(),
    });

    // Calculate average rating
    const totalRatings = book.reviews.length;
    const sumRatings = book.reviews.reduce((sum, review) => sum + review.rating, 0);
    book.averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(1)) : 0;

    // Save the updated book
    await book.save();

    res.status(200).json({ message: 'Review added successfully', book });
  } catch (error) {
    console.error('Error in addReview:', error.message);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

module.exports = {
  fetchBooks,
  getAllBooks,
  getBookById,
  addReview,
};