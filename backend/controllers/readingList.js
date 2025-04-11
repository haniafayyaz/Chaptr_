const ReadingList = require('../models/ReadingList');

const addToReadingList = async (req, res) => {
  try {
    const { username, bookId, bookTitle, bookAuthor, coverImage, totalPages } = req.body;
    const existingBook = await ReadingList.findOne({ username, bookId });
    if (existingBook) {
      return res.status(400).json({ message: 'Book already in reading list' });
    }
    const newBook = new ReadingList({
      username,
      bookId,
      bookTitle,
      bookAuthor,
      coverImage,
      totalPages // Optional: include if provided
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReadingListByUsername = async (req, res) => {
  try {
    const readingList = await ReadingList.find({ username: req.params.username });
    res.json(readingList); // Return array directly
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProgress = async (req, res) => {
    try {
      const { username, bookId, pagesRead } = req.body;
      const book = await ReadingList.findOne({ username, bookId });
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      book.pagesRead = pagesRead;
      book.progress = book.totalPages > 0 ? (pagesRead / book.totalPages) * 100 : 0;
      book.status = 'reading'; 
      if (book.progress >= 100) book.status = 'completed';
      await book.save();
      res.json({ updatedBook: book });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = { addToReadingList, getReadingListByUsername, updateProgress };