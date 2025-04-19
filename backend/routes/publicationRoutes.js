const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publicationController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", publicationController.getPublications);
router.post(
  "/book",
  upload.fields([{ name: "coverImage" }, { name: "bookPdf" }]),
  publicationController.uploadBook
);
router.post("/announcement", publicationController.postAnnouncement);
router.post("/release", publicationController.addReleaseDate);
router.delete("/book", publicationController.removeBook);

module.exports = router;