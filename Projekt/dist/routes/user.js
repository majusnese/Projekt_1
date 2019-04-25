"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose = require("mongoose");
const user_1 = require("../models/user");
const bcrypt = require("bcrypt");
class UserRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err,
                        message: "Error occurred."
                    });
                }
                else {
                    const user = new user_1.default({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: "user created"
                        });
                    })
                        .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err,
                            mesage: "An error occurred after the password was hashed"
                        });
                    });
                }
            });
        });
    }
    init() {
        this.router.post('/signup', this.signup);
    }
}
exports.UserRouter = UserRouter;
const userRoutes = new UserRouter();
userRoutes.init();
exports.default = userRoutes.router;
