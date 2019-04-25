"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const spielSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    platforms: [String],
    price: {
        type: Number,
        min: [0, 'Man bekommt für den Kauf eines Spiels kein Geld'],
        required: true
    }
});
const spiel = mongoose.model('Game', spielSchema);
exports.default = spiel;
