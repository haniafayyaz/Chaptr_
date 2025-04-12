const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const readingListRoutes = require('./routes/readingListRoutes');
const bookClubRoutes = require('./routes/bookClub'); // Book Club Routes
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reading-list', readingListRoutes);
app.use("/api/clubs", bookClubRoutes); // Book Club Routes

// Serve Frontend (Fixes 404 on Refresh)
const clientBuildPath = path.join(__dirname, "client", "build");
app.use(express.static(clientBuildPath));

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
