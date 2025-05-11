const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const User = require("../models/Users");
const Admin = require("../models/Admin");

// Validation helper functions
const validateEmail = (email) => {
  return email && 
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
         email.length <= 100;
};

const validateName = (name) => {
  return name && 
         /^[A-Za-z\s]{2,50}$/.test(name);
};

const validateUsername = (username) => {
  return username && 
         /^[A-Za-z0-9_]{3,20}$/.test(username);
};

const validatePassword = (password) => {
  return password && 
         /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,50}$/.test(password);
};

// Validation middleware for login
const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .customSanitizer((value) => sanitizeHtml(value)),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Validation middleware for registration
const validateRegister = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((value) => validateName(value))
    .withMessage("Name must be 2-50 characters and contain only letters and spaces")
    .customSanitizer((value) => sanitizeHtml(value)),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .custom((value) => validateEmail(value))
    .withMessage("Invalid email format or too long")
    .normalizeEmail()
    .customSanitizer((value) => sanitizeHtml(value)),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .custom((value) => validateUsername(value))
    .withMessage("Username must be 3-20 characters and contain only letters, numbers, or underscores")
    .customSanitizer((value) => sanitizeHtml(value)),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => validatePassword(value))
    .withMessage(
      "Password must be 8-50 characters, contain at least one capital letter, one digit, and only letters and numbers"
    ),
  body("isAuthor").optional().isBoolean().withMessage("isAuthor must be a boolean"),
];

// Validation middleware for admin login
const validateAdminLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .customSanitizer((value) => sanitizeHtml(value)),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const setAuthCookies = (res, token, userId) => {
  // JWT cookie (1 hour)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
    sameSite: "strict",
    maxAge: 3600 * 1000, // 1 hour in milliseconds
  });

  // Session cookie (2 minutes)
  res.cookie("session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 120 * 1000, // 2 minutes in milliseconds
  });
};

const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array()[0].msg;
      console.error("Login Validation Error:", {
        message: errorMsg,
        errors: errors.array(),
        input: { email: req.body.email },
      });
      return res.status(400).json({ message: errorMsg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.error("Login Failed: User not found", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Login Failed: Incorrect password", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, username: user.username, isAuthor: user.isAuthor, role: user.isAuthor ? "author" : "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    setAuthCookies(res, token, user._id.toString());

    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, email: user.email, username: user.username, isAuthor: user.isAuthor },
    });
  } catch (error) {
    console.error("Login Error:", {
      message: error.message,
      stack: error.stack,
      input: { email: req.body.email },
    });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array()[0].msg;
      console.error("Registration Validation Error:", {
        message: errorMsg,
        errors: errors.array(),
        input: {
          email: req.body.email,
          username: req.body.username,
          name: req.body.name,
          isAuthor: req.body.isAuthor,
        },
      });
      return res.status(400).json({ message: errorMsg });
    }

    const { name, email, username, password, isAuthor } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("Registration Failed: Email already registered", { email });
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.error("Registration Failed: Username already taken", { username });
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      isAuthor: isAuthor || false,
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, name: newUser.name, email: newUser.email, username: newUser.username, isAuthor: newUser.isAuthor, role: isAuthor ? "author" : "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    setAuthCookies(res, token, newUser._id.toString());

    res.status(201).json({
      message: "Registration successful",
      user: { name, email, username, isAuthor },
    });
  } catch (error) {
    console.error("Registration Error:", {
      message: error.message,
      stack: error.stack,
      input: {
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        isAuthor: req.body.isAuthor,
      },
    });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const adminLogin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = errors.array()[0].msg;
      console.error("Admin Login Validation Error:", {
        message: errorMsg,
        errors: errors.array(),
        input: { email: req.body.email },
      });
      return res.status(400).json({ message: errorMsg });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.error("Admin Login Failed: Admin not found", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.error("Admin Login Failed: Incorrect password", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: admin._id, email: admin.email, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    setAuthCookies(res, token, admin._id.toString());

    res.status(200).json({
      message: "Admin login successful",
      user: { name: admin.username, email: admin.email, username: admin.username, isAuthor: false },
    });
  } catch (error) {
    console.error("Admin Login Error:", {
      message: error.message,
      stack: error.stack,
      input: { email: req.body.email },
    });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

const verifySession = async (req, res) => {
  try {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) {
      console.error("Session Verification Failed: No session cookie", {
        userId: req.user?.userId,
      });
      return res.status(403).json({ message: "Session expired, please log in again." });
    }

    // Verify session cookie matches user ID
    if (sessionCookie !== req.user.userId) {
      console.error("Session Verification Failed: Invalid session cookie", {
        userId: req.user?.userId,
        sessionCookie,
      });
      return res.status(403).json({ message: "Invalid session, please log in again." });
    }

    res.status(200).json({
      message: "Session is valid",
      user: {
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        isAuthor: req.user.isAuthor,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Session Verification Error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { login, register, adminLogin, verifySession, validateLogin, validateRegister, validateAdminLogin };