const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) next();
        else {
            req.user = user;
            next();
        }
    });
}

module.exports = authToken;