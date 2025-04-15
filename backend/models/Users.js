const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: null },
  profilePicture: { type: String, default: null },
  isAuthor: { type: Boolean, default: false },
  followers: [{ type: String, default: [] }], // Array of usernames who follow this user
});

const User = mongoose.model("User", userSchema);

module.exports = User;