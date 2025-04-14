const Club = require('../models/Club');
const Post = require('../models/Post');
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
    const { name, description, tags, username } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Cover image is required (JPEG/JPG/PNG)' });
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : tags;
    }

    const clubData = {
      name,
      description,
      tags: parsedTags,
      members: [username],
      coverImage: `/uploads/${req.file.filename}`,
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

// Join a club
exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.members = Array.isArray(club.members) ? club.members : [];
    if (club.members.includes(username)) {
      return res.status(400).json({ message: 'You are already a member of this club' });
    }

    club.members.push(username);
    await club.save();

    res.status(200).json(club);
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ message: 'Error joining club', error: error.message });
  }
};

// Get club details
exports.getClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.status(200).json({
      ...club.toObject(),
      members: Array.isArray(club.members) ? club.members : [],
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ message: 'Error fetching club', error: error.message });
  }
};

// Get posts for a club
exports.getPosts = async (req, res) => {
  try {
    const { clubId } = req.params;
    const posts = await Post.find({ clubId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { username, text } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Verify user is a member
    club.members = Array.isArray(club.members) ? club.members : [];
    if (!club.members.includes(username)) {
      return res.status(403).json({ message: 'You are not a member of this club' });
    }

    const newPost = new Post({
      clubId,
      username,
      text,
    });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};