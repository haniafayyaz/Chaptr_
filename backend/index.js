require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const readingListRoutes = require("./routes/readingListRoutes");
const bookClubRoutes = require("./routes/bookClub");
const goalRoutes = require("./routes/goalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authorRoutes = require("./routes/authorRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const userRoutes = require("./routes/userRoutes");
const readingChallengeRoutes = require("./routes/readingChallengeRoutes");

const app = express();

// Global rate limiting for API endpoints: 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests
  message: { message: "Too many requests from this IP, please try again later" },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter); // Apply global rate limiter to all /api/* routes

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reading-list", readingListRoutes);
app.use("/api/clubs", bookClubRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/users", userRoutes);
app.use("/api/reading-challenges", readingChallengeRoutes);

// Serve Frontend (Fixes 404 on Refresh)
const clientBuildPath = path.join(__dirname, "client", "build");
app.use(express.static(clientBuildPath));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Handle React Router Paths (Fixes 404 on Refresh)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  } else {
    res.status(404).json({ message: "API route not found" });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});