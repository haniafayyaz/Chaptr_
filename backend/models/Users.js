const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: null },
  profilePicture: { type: String, default: null }, // Stores URL or path to profile picture
  isAuthor: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema); // Collection name: 'users'

module.exports = User;