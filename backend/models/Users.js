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
  authorProfile: {
    type: {
      books: [
        {
          title: { type: String, required: true },
          releaseDate: { type: String, required: true }, // Stored as string per example
        },
      ],
      bookDetails: [
        {
          bookPdf: { type: String, required: true }, // URL or path to PDF
          name: { type: String, required: true }, // Book name
          genre: { type: String, required: true }, // Book genre
          coverImage: { type: String, required: true }, // URL or path to cover image
        },
      ],
      announcements: [
        {
          title: { type: String, required: true },
          content: { type: String, required: true },
          date: { type: String, required: true }, // Stored as string per example
        },
      ],
    },
    default: null, // Set authorProfile to null by default
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;