const mongoose = require("mongoose");

const userChallengeProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "ReadingChallenge", required: true },
  pagesRead: { type: Number, default: 0 }, // Track progress (pages read by the user)
  joinedAt: { type: Date, default: Date.now }, // When the user joined the challenge
});

const UserChallengeProgress = mongoose.model("UserChallengeProgress", userChallengeProgressSchema);

module.exports = UserChallengeProgress;