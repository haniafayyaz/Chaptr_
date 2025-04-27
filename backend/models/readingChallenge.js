const mongoose = require("mongoose");

const readingChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  noOfPages: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserChallengeProgress" }], // References to progress records
});

const ReadingChallenge = mongoose.model("ReadingChallenge", readingChallengeSchema);

module.exports = ReadingChallenge;