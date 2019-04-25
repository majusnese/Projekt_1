"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    }
});
const user = mongoose.model('User', userSchema);
exports.default = user;
