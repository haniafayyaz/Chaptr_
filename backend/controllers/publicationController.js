const User = require("../models/Users");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // For file deletion

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "Uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get author profile
exports.getPublications = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ authorProfile: user.authorProfile });
  } catch (error) {
    res.status(500).json({ message: "Error fetching publications" });
  }
};

// Upload book
exports.uploadBook = async (req, res) => {
  try {
    const { name, genre, username } = req.body;
    const coverImage = req.files.coverImage ? `/Uploads/${req.files.coverImage[0].filename}` : null;
    const bookPdf = req.files.bookPdf ? `/Uploads/${req.files.bookPdf[0].filename}` : null;

    if (!coverImage || !bookPdf) {
      return res.status(400).json({ message: "Cover image and PDF are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.authorProfile) {
      user.authorProfile = { books: [], bookDetails: [], announcements: [] };
    }

    user.authorProfile.bookDetails.push({ bookPdf, name, genre, coverImage });
    await user.save();
    res.status(201).json(user.authorProfile);
  } catch (error) {
    res.status(500).json({ message: "Error uploading book" });
  }
};

// Post announcement
exports.postAnnouncement = async (req, res) => {
  try {
    const { title, content, username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.authorProfile) {
      user.authorProfile = { books: [], bookDetails: [], announcements: [] };
    }

    user.authorProfile.announcements.push({ title, content, date: new Date().toISOString().split("T")[0] });
    await user.save();
    res.status(201).json(user.authorProfile);
  } catch (error) {
    res.status(500).json({ message: "Error posting announcement" });
  }
};

// Add release date
exports.addReleaseDate = async (req, res) => {
  try {
    const { title, releaseDate, username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.authorProfile) {
      user.authorProfile = { books: [], bookDetails: [], announcements: [] };
    }

    user.authorProfile.books.push({ title, releaseDate });
    await user.save();
    res.status(201).json(user.authorProfile);
  } catch (error) {
    res.status(500).json({ message: "Error adding release date" });
  }
};

// Remove book
exports.removeBook = async (req, res) => {
  try {
    const { username, name } = req.body;

    // Validate input
    if (!username || !name) {
      return res.status(400).json({ message: "Username and book name are required" });
    }

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if authorProfile exists
    if (!user.authorProfile || !user.authorProfile.bookDetails) {
      return res.status(404).json({ message: "No books found for this author" });
    }

    // Find the book to delete
    const bookIndex = user.authorProfile.bookDetails.findIndex((book) => book.name === name);
    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Get file paths to delete
    const book = user.authorProfile.bookDetails[bookIndex];
    const coverImagePath = book.coverImage ? path.join(__dirname, "..", book.coverImage) : null;
    const bookPdfPath = book.bookPdf ? path.join(__dirname, "..", book.bookPdf) : null;

    // Remove the book from bookDetails
    user.authorProfile.bookDetails.splice(bookIndex, 1);
    await user.save();

    // Delete files from the filesystem
    try {
      if (coverImagePath) await fs.unlink(coverImagePath);
      if (bookPdfPath) await fs.unlink(bookPdfPath);
    } catch (fileError) {
      console.error("Error deleting files:", fileError);
      // Continue even if file deletion fails (files might have been moved or deleted already)
    }

    res.status(200).json(user.authorProfile);
  } catch (error) {
    console.error("Error removing book:", error);
    res.status(500).json({ message: "Error removing book" });
  }
};