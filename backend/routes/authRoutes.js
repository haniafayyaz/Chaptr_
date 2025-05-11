const express = require("express");
const { login, register, adminLogin, validateLogin,verifySession, validateRegister, validateAdminLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.post("/admin", validateAdminLogin, adminLogin);

router.get("/verify-session", authMiddleware, verifySession);

module.exports = router;