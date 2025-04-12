const mongoose = require('mongoose');

const readingListSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  bookId: {
    type: String,
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookAuthor: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['wantToRead', 'reading', 'completed'], // Define possible statuses
    default: 'wantToRead' // Default to "wantToRead"
  },
  progress: {
    type: Number,
    default: 0 // Percentage (0-100)
  },
  totalPages: {
    type: Number,
    default: 0
  },
  pagesRead: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('ReadingList', readingListSchema);