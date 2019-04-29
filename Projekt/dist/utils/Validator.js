"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
function isGame(game) {
    if (!util_1.isString(game.name) ||
        !util_1.isArray(game.platforms) ||
        !util_1.isNumber(game.price)) {
        return false;
    }
    let check = true;
    game.platforms.forEach(element => {
        if (!["PC", "XBOX", "PS4"].includes(element)) {
            check = false;
        }
    });
    if (!check) {
        return false;
    }
    return true;
}
exports.isGame = isGame;
function isSeller(seller) {
    if (!util_1.isString(seller.label) ||
        !util_1.isNumber(seller.locations) ||
        !util_1.isString(seller.headquarter) ||
        isGame(seller.game)) {
        return false;
    }
    if (seller.locations < 1) {
        return false;
    }
    return true;
}
exports.isSeller = isSeller;
function isValidValue(prop, value) {
    if (prop == "_id") {
        return false;
    }
    let typeValue = typeof value;
    if (prop === "name" && typeValue === "string") {
        return true;
    }
    if (prop === "platforms" && util_1.isArray(value)) {
        return true;
    }
    if (prop === "price" && typeValue == "number") {
        return true;
    }
    return false;
}
exports.isValidValue = isValidValue;
function isPropName(prop) {
    if (["name", "platforms", "price"].includes(prop)) {
        return true;
    }
    return false;
}
exports.isPropName = isPropName;
