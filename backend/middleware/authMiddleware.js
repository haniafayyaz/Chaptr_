const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    console.error("Authentication Failed: No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication Failed: Invalid token", {
      message: error.message,
      stack: error.stack,
    });
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;