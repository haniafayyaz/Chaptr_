const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorsController");

// Get all authors
router.get("/", authorController.getAllAuthors);

// Follow/Unfollow an author
router.post("/:id/follow", authorController.followAuthor);
router.get("/announcements", authorController.getFollowedAuthorsAnnouncements);
router.get("/books", authorController.getFollowedAuthorsBooks);

module.exports = router;