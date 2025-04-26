const User = require("../models/Users");

exports.getReleases = async (req, res) => {
  try {
    const authors = await User.find({ isAuthor: true, authorProfile: { $ne: null } }, "username authorProfile.books");
    const releases = authors
      .flatMap((author) =>
        (author.authorProfile.books || []).map((book) => ({
          title: book.title,
          releaseDate: book.releaseDate,
          author: author.username,
        }))
      )
      .filter((release) => release.releaseDate); // Ensure releaseDate exists
    res.status(200).json(releases);
  } catch (error) {
    console.error("Error fetching releases:", error);
    res.status(500).json({ message: "Error fetching release dates" });
  }
};