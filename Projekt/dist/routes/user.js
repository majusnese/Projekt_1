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
class UserRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            user_1.default.find({ email: req.body.email })
                .exec()
                .then(user => {
                if (user.length >= 1) {
                    return res.status(422).json({
                        message: "Mail already in use"
                    });
                }
                else {
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
                }
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    mesage: "An error occurred while searching for a duplicate email"
                });
            });
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        }, process.env.JWT_KEY, {
                            expiresIn: "1h"
                        });
                        return res.status(200).json({
                            message: "Auth succesful",
                            token: token
                        });
                    }
                    res.status(401).json({
                        message: "Auth failed"
                    });
                });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        });
    }
    del(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            user_1.default.remove({ _id: req.params.uid })
                .exec()
                .then(result => {
                res.status(200).json({
                    message: "User deleted"
                });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    message: "Delete was not succesful"
                });
            });
        });
    }
    init() {
        this.router.post("/signup", this.signup);
        this.router.delete("/uid", this.del);
        this.router.get("/login", this.login);
    }
}
exports.UserRouter = UserRouter;
const userRoutes = new UserRouter();
userRoutes.init();
exports.default = userRoutes.router;
