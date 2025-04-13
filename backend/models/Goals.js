const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  dailyPagesGoal: {
    type: Number,
    required: true,
    min: 1
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  goalCompletionDate: {
    type: Date
  }
});

module.exports = mongoose.model('Goal', goalSchema);