// models/club.js
const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String, // URL to the current book's cover image
    default: '',
  },
  currentBook: {
    title: { type: String, required: true },
    author: { type: String, required: true },
  },
  tags: {
    type: [String], // e.g., ["Science Fiction", "Space"]
    default: [],
  },
  members: {
    type: Number,
    default: 0,
  },
  schedule: {
    type: String, // e.g., "Every Thursday"
    default: '',
  },
  isMember: {
    type: Boolean, // Indicates if the logged-in user is a member (simplified for demo)
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Club', clubSchema);