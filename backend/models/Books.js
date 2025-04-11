// backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, default: 'Unknown' }, // Added genre field
  totalPages: { type: Number, default: 0 },
  coverImage: { type: String },
  summary: { type: String, default: 'No summary available' }, // Added summary field
});

module.exports = mongoose.model('Book', bookSchema);
