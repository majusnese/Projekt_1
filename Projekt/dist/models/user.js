"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Validator_1 = require("../utils/Validator");
const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: Validator_1.regex
    },
    password: {
        type: String,
        required: true
    }
});
const user = mongoose.model("User", userSchema);
exports.default = user;
