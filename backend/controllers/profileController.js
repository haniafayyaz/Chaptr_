const User = require('../models/Users');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pictures/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.username}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpeg, jpg, png)!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('profilePicture');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, username, email, password, bio } = req.body;
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (username) {
      // Check if new username is taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    if (email) {
      // Check if new email is taken
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (bio) user.bio = bio;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle profile picture upload
const uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const user = await User.findOne({ username: req.user.username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update profile picture path
      user.profilePicture = `/uploads/profile_pictures/${req.file.filename}`;
      await user.save();
      res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture
};