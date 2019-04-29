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
const jwt = require("jsonwebtoken");
const logger_1 = require("../utils/logger");
const fast_safe_stringify_1 = require("fast-safe-stringify");
const Validator_1 = require("../utils/Validator");
class UserRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user_1.default.find({ email: req.body.email })
                    .exec()
                    .then(user => {
                    if (user.length >= 1) {
                        logger_1.logger.error(`user signup Error because of duplicate email`);
                        res.status(422).json({
                            message: "Mail already in use"
                        });
                    }
                    else {
                        bcrypt.hash(req.body.password, 12, (err, hash) => {
                            if (err) {
                                res.status(500).json({
                                    error: err,
                                    message: "Error occurred."
                                });
                            }
                            else {
                                if (Validator_1.regex.test(req.body.email)) {
                                    const user = new user_1.default({
                                        _id: new mongoose.Types.ObjectId(),
                                        email: req.body.email,
                                        password: hash
                                    });
                                    user.save().then(result => {
                                        res.status(201).json({
                                            message: "user created",
                                            uid: user._id
                                        });
                                    });
                                }
                                else {
                                    logger_1.logger.error(`user signup Error because of invalid email`);
                                    res.status(422).json({
                                        message: "invalid email"
                                    });
                                }
                            }
                        });
                    }
                })
                    .catch(err => {
                    logger_1.logger.error(`user signup Error: ${fast_safe_stringify_1.default(err)}`);
                });
            }
            catch (err) {
                logger_1.logger.error("user signup failed");
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const jwt_key = process.env.JWT_KEY;
            user_1.default.find({ email: req.body.email })
                .exec()
                .then(user => {
                if (user.length < 1) {
                    res.status(401).json({
                        message: "Auth failed"
                    });
                }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        res.status(401).json({
                            message: "Auth failed"
                        });
                    }
                    if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        }, jwt_key, {
                            expiresIn: "1h"
                        });
                        console.log(user[0]._id);
                        return res.status(200).json({
                            message: "Auth succesful",
                            id: user[0]._id,
                            token: token
                        });
                    }
                    res.status(401).json({
                        message: "Auth failed"
                    });
                });
            })
                .catch(err => {
                logger_1.logger.error(`user login Error: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    del(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.uid);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Delete user error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: "Please pass a valid ID"
                    });
                };
            }
            user_1.default.remove({ _id: id })
                .exec()
                .then(result => {
                res.status(200).json({
                    message: "User deleted"
                });
            })
                .catch(err => {
                logger_1.logger.error(`user delete Error: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    init() {
        this.router.post("/signup", this.signup);
        this.router.delete("/:uid", this.del);
        this.router.post("/login", this.login);
    }
}
exports.UserRouter = UserRouter;
const userRoutes = new UserRouter();
userRoutes.init();
exports.default = userRoutes.router;
