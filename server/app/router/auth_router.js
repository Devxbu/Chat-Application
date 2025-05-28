const express = require("express");
const router = express.Router();
const { register, login, logout, refresh_token } = require("../controller/auth_controller");

const multer = require("multer");
const upload = multer();

// Routers
router.post('/register', upload.none(), register);
router.post('/login', upload.none(), login);
router.post("/logout", upload.none(), logout);
router.post('/refresh-token', upload.none(), refresh_token);

module.exports = router