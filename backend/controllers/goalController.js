const Goal = require('../models/Goals');

exports.setGoal = async (req, res) => {
  try {
    const { username, dailyPagesGoal } = req.body;

    if (!username || !dailyPagesGoal) {
      return res.status(400).json({ message: 'Username and daily pages goal are required' });
    }

    let goal = await Goal.findOne({ username });
    
    if (goal) {
      goal.dailyPagesGoal = dailyPagesGoal;
      goal.currentProgress = 0;
      await goal.save();
    } else {
      goal = await Goal.create({
        username,
        dailyPagesGoal,
        currentProgress: 0,
        streak: 0
      });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error setting goal', error: error.message });
  }
};

exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ username: req.params.username });
    if (!goal) {
      return res.status(200).json({ 
        dailyPagesGoal: 0,
        currentProgress: 0,
        streak: 0
      });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { username, pagesRead } = req.body;

    if (!username || pagesRead === undefined) {
      return res.status(400).json({ message: 'Username and pages read are required' });
    }

    let goal = await Goal.findOne({ username });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if it's a new day
    if (goal.lastUpdated < today) {
      // If goal was completed yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (goal.goalCompletionDate && goal.goalCompletionDate >= yesterday) {
        goal.streak += 1;
      } else {
        goal.streak = 0;
      }
      
      goal.currentProgress = 0;
    }

    goal.currentProgress += pagesRead;
    goal.lastUpdated = new Date();

    // Check if goal is completed
    if (goal.currentProgress >= goal.dailyPagesGoal && !goal.goalCompletionDate) {
      goal.goalCompletionDate = new Date();
      goal.streak += 1;
    }

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal progress', error: error.message });
  }
};