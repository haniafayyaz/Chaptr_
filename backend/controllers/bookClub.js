// controllers/clubController.js
const Club = require('../models/Club');


console.log('Club model:', Club); // Add this line
// Get all clubs
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    console.log(clubs);
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
};

// Create a new club (for the "Create Club" button functionality)
exports.createClub = async (req, res) => {
  try {
    const { name, description, currentBook, tags, schedule } = req.body;
    const newClub = new Club({
      name,
      description,
      currentBook,
      tags,
      schedule,
      members: 1, // Assuming the creator is the first member
      isMember: true, // The creator is a member
    });
    await newClub.save();
    res.status(201).json(newClub);
  } catch (error) {
    res.status(500).json({ message: 'Error creating club', error: error.message });
  }
};