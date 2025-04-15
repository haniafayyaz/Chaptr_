const User = require("../models/Users");

// Get all authors
exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await User.find({ isAuthor: true }).select(
      "name username bio profilePicture followers"
    );
    res.status(200).json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({ message: "Server error while fetching authors" });
  }
};

// Follow/Unfollow an author
exports.followAuthor = async (req, res) => {
  const { username } = req.body;
  const authorId = req.params.id;

  try {
    const author = await User.findById(authorId);
    if (!author || !author.isAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle follow status
    if (author.followers.includes(username)) {
      author.followers = author.followers.filter((follower) => follower !== username);
    } else {
      author.followers.push(username);
    }

    await author.save();
    res.status(200).json(author);
  } catch (error) {
    console.error("Error following/unfollowing author:", error);
    res.status(500).json({ message: "Server error while following/unfollowing author" });
  }
};