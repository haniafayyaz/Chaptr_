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
    let goal = await Goal.findOne({ username: req.params.username });
    
    if (!goal) {
      return res.status(200).json({ 
        dailyPagesGoal: 0,
        currentProgress: 0,
        streak: 0
      });
    }

    // Check if it's a new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastUpdatedDate = new Date(goal.lastUpdated);
    lastUpdatedDate.setHours(0, 0, 0, 0);

    if (lastUpdatedDate < today) {
      // Reset progress for new day
      goal.currentProgress = 0;
      // Update streak: reset if no completion yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const completionDate = goal.goalCompletionDate ? new Date(goal.goalCompletionDate) : null;
      if (completionDate) {
        completionDate.setHours(0, 0, 0, 0);
        if (completionDate < yesterday) {
          goal.streak = 0;
        }
      } else {
        goal.streak = 0;
      }
      goal.lastUpdated = new Date();
      await goal.save();
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
    const lastUpdatedDate = new Date(goal.lastUpdated);
    lastUpdatedDate.setHours(0, 0, 0, 0);

    // Check if it's a new day
    if (lastUpdatedDate < today) {
      // Reset progress for new day
      goal.currentProgress = 0;
      // Update streak: reset if no completion yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const completionDate = goal.goalCompletionDate ? new Date(goal.goalCompletionDate) : null;
      if (completionDate) {
        completionDate.setHours(0, 0, 0, 0);
        if (completionDate < yesterday) {
          goal.streak = 0;
        }
      } else {
        goal.streak = 0;
      }
    }

    // Update progress
    goal.currentProgress += pagesRead;
    goal.lastUpdated = new Date();

    // Check if goal is completed for today
    const completionDate = goal.goalCompletionDate ? new Date(goal.goalCompletionDate) : null;
    const completionDay = completionDate ? new Date(completionDate).setHours(0, 0, 0, 0) : null;

    if (goal.currentProgress >= goal.dailyPagesGoal && completionDay !== today.getTime()) {
      const now = new Date();
      goal.goalCompletionDate = now;
      goal.lastUpdated = now;
      // Increment streak only if not already completed today
      goal.streak += 1;
    }

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal progress', error: error.message });
  }
};