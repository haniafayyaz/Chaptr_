const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Secret key from .env file
    req.user = decoded; // Attach the decoded user data to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("❌ Invalid token:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;