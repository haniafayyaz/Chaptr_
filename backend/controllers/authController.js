const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import JWT
const User = require("../models/Users");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, username: user.username },
      process.env.JWT_SECRET, // Secret key from .env file
      { expiresIn: "1h" } // Expiry time for the token
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, username: user.username },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const register = async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const newUser = new User({ name, email, username, password: hashedPassword });
    await newUser.save();

    // Create a JWT token
    const token = jwt.sign(
      { userId: newUser._id, name: newUser.name, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET, // Secret key from .env file
      { expiresIn: "1h" } // Expiry time for the token
    );

    res.status(201).json({
      message: "Registration successful",
      user: { name, email, username },
      token,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { login, register };