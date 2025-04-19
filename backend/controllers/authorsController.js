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

// Get announcements from followed authors
exports.getFollowedAuthorsAnnouncements = async (req, res) => {
  try {
    const username = req.query.username;
    console.log("Received query params:", req.query);
    console.log("Fetching announcements for username:", username);
    if (!username) {
      console.log("Username query parameter missing");
      return res.status(400).json({ message: "Username query parameter is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const authors = await User.find({
      isAuthor: true,
      followers: user.username
    }).select("username authorProfile.announcements");
    console.log("Found authors:", authors);

    const announcements = authors
      .filter(author => author.authorProfile && Array.isArray(author.authorProfile.announcements) && author.authorProfile.announcements.length > 0)
      .flatMap(author =>
        author.authorProfile.announcements.map(announcement => ({
          title: announcement.title || "",
          content: announcement.content || "",
          date: announcement.date || "",
          authorUsername: author.username
        }))
      )
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    console.log("Announcements:", announcements);
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Server error while fetching announcements" });
  }
};

// Get books from followed authors
exports.getFollowedAuthorsBooks = async (req, res) => {
  try {
    const username = req.query.username;
    console.log("Received query params:", req.query);
    console.log("Fetching books for username:", username);
    if (!username) {
      console.log("Username query parameter missing");
      return res.status(400).json({ message: "Username query parameter is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const authors = await User.find({
      isAuthor: true,
      followers: user.username
    }).select("username authorProfile.bookDetails");
    console.log("Found authors:", authors);

    const books = authors
      .filter(author => author.authorProfile && Array.isArray(author.authorProfile.bookDetails) && author.authorProfile.bookDetails.length > 0)
      .flatMap(author =>
        author.authorProfile.bookDetails.map(book => ({
          name: book.name || "",
          genre: book.genre || "",
          bookPdf: book.bookPdf || "",
          coverImage: book.coverImage || "",
          authorUsername: author.username
        }))
      );

    console.log("Books:", books);
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error while fetching books" });
  }
};