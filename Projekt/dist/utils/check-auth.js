"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decod = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decod;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Auth failed"
        });
    }
};
