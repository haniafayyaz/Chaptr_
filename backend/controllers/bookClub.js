const Club = require('../models/Club');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (JPEG/JPG/PNG)'));
  },
});

exports.uploadCoverImage = upload.single('coverImage');

// Get all clubs
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    // Sanitize members to ensure it's an array
    const sanitizedClubs = clubs.map(club => ({
      ...club.toObject(),
      members: Array.isArray(club.members) ? club.members : [],
    }));
    res.status(200).json(sanitizedClubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
};

// Create a new club
exports.createClub = async (req, res) => {
  try {
    console.log('POST /api/clubs received:', req.body, req.file);

    // Extract fields from FormData
    const { name, description, tags, username } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    // Validate username
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Validate cover image
    if (!req.file) {
      return res.status(400).json({ message: 'Cover image is required (JPEG/JPG/PNG)' });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : tags;
    }

    // Create club data
    const clubData = {
      name,
      description,
      tags: parsedTags,
      members: [username],
      coverImage: `/uploads/${req.file.filename}`, // Store image URL
    };

    const newClub = new Club(clubData);
    await newClub.save();
    console.log('Created club:', newClub);
    res.status(201).json(newClub);
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Error creating club', error: error.message });
  }
};