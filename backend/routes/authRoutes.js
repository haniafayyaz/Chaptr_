const express = require("express");
const { login, register, adminLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/admin", adminLogin);

module.exports = router;
