const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, default: 'Unknown' },
  totalPages: { type: Number },
  coverImage: { type: String },
  summary: { type: String, default: 'No summary available' },
  reviews: [
    {
      reviewerName: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, default: '' },
      date: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 }, // New field for average rating
});

module.exports = mongoose.model('Book', bookSchema);