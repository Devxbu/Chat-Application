const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const expressValidator = require("express-validator");

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

exports.register = async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, username, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: "This email, username or phone number is already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, username, password: hashedPassword, phone });
        await newUser.save();

        const verificationLink = `${process.env.FRONTEND_URL}/verify/${newUser.emailVerificationToken.token}`;
        await sendEmail(email, verificationLink);

        return res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        return res.status(500).json({ message: "User creation error" });
    }
}

exports.login = async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        await user.updateOne({ refreshToken });
        res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        if (user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        await user.updateOne({ refreshToken: null });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(403).json({ message: "Forbidden" });
    }
}

exports.refresh_token = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        const accessToken = generateAccessToken(user._id);
        res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(403).json({ message: "Forbidden" });
    }
}

