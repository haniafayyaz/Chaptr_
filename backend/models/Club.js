const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  coverImage: {
    type: String, // URL to the club's cover image
    default: '',
  },
  tags: {
    type: [String], // e.g., ["Science Fiction", "Space"]
    default: [],
  },
  members: [{
    type: String, // Username of each member
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Club', clubSchema);