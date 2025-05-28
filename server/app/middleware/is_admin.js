const User = require("../model/User");

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}

module.exports = isAdmin;
