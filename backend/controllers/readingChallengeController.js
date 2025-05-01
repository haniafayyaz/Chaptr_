const ReadingChallenge = require('../models/readingChallenge');
const UserChallengeProgress = require('../models/userChallengeProgress');
const User = require('../models/users');

exports.createReadingChallenge = async (req, res) => {
  try {
    const { title, startDate, endDate, noOfPages } = req.body;

    // Validate input
    if (!title || !startDate || !endDate || !noOfPages) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    if (isNaN(noOfPages) || Number(noOfPages) <= 0) {
      return res.status(400).json({ message: 'Number of pages must be a positive number.' });
    }

    // Create new reading challenge
    const newChallenge = new ReadingChallenge({
      title,
      startDate: start,
      endDate: end,
      noOfPages: Number(noOfPages),
      participants: [],
    });

    await newChallenge.save();
    res.status(201).json({ message: 'Reading challenge created successfully.', challenge: newChallenge });
  } catch (error) {
    console.error('Create reading challenge error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await ReadingChallenge.find();
    res.status(200).json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getEnrolledChallenges = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const progressRecords = await UserChallengeProgress.find({ user: user._id })
      .populate('challenge')
      .lean();

    res.status(200).json(progressRecords);
  } catch (error) {
    console.error('Error fetching enrolled challenges:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.enrollInChallenge = async (req, res) => {
  try {
    const { username, challengeId } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const challenge = await ReadingChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    // Check if user is already enrolled
    const existingProgress = await UserChallengeProgress.findOne({
      user: user._id,
      challenge: challengeId,
    });
    if (existingProgress) {
      return res.status(400).json({ message: 'User is already enrolled in this challenge.' });
    }

    // Create progress record
    const progress = new UserChallengeProgress({
      user: user._id,
      challenge: challengeId,
      pagesRead: 0,
      joinedAt: new Date(),
    });

    await progress.save();

    // Update user and challenge
    await User.findByIdAndUpdate(user._id, { $push: { challenges: progress._id } });
    await ReadingChallenge.findByIdAndUpdate(challengeId, { $push: { participants: progress._id } });

    res.status(201).json({ message: 'Successfully enrolled in challenge.', progress });
  } catch (error) {
    console.error('Error enrolling in challenge:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.updateChallengeProgress = async (req, res) => {
  try {
    const { username, challengeId, pagesRead } = req.body;

    // Validate input
    if (!username || !challengeId || pagesRead === undefined) {
      return res.status(400).json({ message: 'Username, challenge ID, and pages read are required.' });
    }

    if (isNaN(pagesRead) || pagesRead < 0) {
      return res.status(400).json({ message: 'Pages read must be a non-negative number.' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find challenge
    const challenge = await ReadingChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    // Check if challenge is active (within start and end dates)
    const currentDate = new Date();
    if (currentDate < challenge.startDate) {
      return res.status(400).json({ message: 'Challenge has not started yet.' });
    }
    if (currentDate > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge has already ended.' });
    }

    // Find progress record
    const progress = await UserChallengeProgress.findOne({
      user: user._id,
      challenge: challengeId,
    });
    if (!progress) {
      return res.status(400).json({ message: 'User is not enrolled in this challenge.' });
    }

    // Update pages read (cap at challenge's noOfPages)
    const newPagesRead = Math.min(progress.pagesRead + Number(pagesRead), challenge.noOfPages);
    progress.pagesRead = newPagesRead;

    await progress.save();

    // Populate challenge data for response
    const updatedProgress = await UserChallengeProgress.findById(progress._id)
      .populate('challenge')
      .lean();

    res.status(200).json({ message: 'Challenge progress updated successfully.', progress: updatedProgress });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};