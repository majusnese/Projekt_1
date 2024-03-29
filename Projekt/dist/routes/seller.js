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
const seller_1 = require("../models/seller");
const games_1 = require("../models/games");
const checkAuth = require("../utils/check-auth");
const logger_1 = require("../utils/logger");
const fast_safe_stringify_1 = require("fast-safe-stringify");
const Validator_1 = require("../utils/Validator");
const Validator_2 = require("../utils/Validator");
const Validator_3 = require("../utils/Validator");
class SellerRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    find(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            seller_1.default.find()
                .select("label locations _id headquarter game")
                .populate("game")
                .exec()
                .then(docs => {
                const response = {
                    count: docs.length,
                    sellers: docs.map(doc => {
                        return {
                            label: doc.label,
                            locations: doc.locations,
                            _id: doc._id,
                            game: doc.game,
                            request: {
                                type: "GET",
                                description: "The link to look at this seller individually",
                                url: "http://localhost:3000/sellers/" + doc._id
                            }
                        };
                    })
                };
                if (docs.length > 0) {
                    res.status(200).json(response);
                }
                else {
                    logger_1.logger.debug(`Findall did not find entries`);
                    res.status(400).json({
                        message: "There are no entries"
                    });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Findall seller Error: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.body.game;
            try {
                id = mongoose.Types.ObjectId(req.body.game);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Create seller failed due to a wrong ID ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: "Please pass a valid ID"
                    });
                };
            }
            let check = yield games_1.default.findById(id)
                .exec()
                .then(doc => {
                if (doc) {
                    return true;
                }
                return false;
            })
                .catch(error => {
                logger_1.logger.error(`Update failed while trying to find correlated Game: ${fast_safe_stringify_1.default(error)}`);
            });
            if (check) {
                const seller = new seller_1.default({
                    id: new mongoose.Types.ObjectId(),
                    label: req.body.label,
                    locations: req.body.locations,
                    headquarter: req.body.headquarter,
                    game: req.body.game
                });
                if (Validator_1.isSeller(seller)) {
                    seller
                        .save()
                        .then(result => {
                        res.status(201).json({
                            message: "Post request successful to /sellers",
                            createdSeller: {
                                label: result.label,
                                locations: result.locations,
                                headquarter: result.headquarter,
                                _id: result._id,
                                game: result.game,
                                request: {
                                    type: "GET",
                                    description: "Look at the created seller",
                                    url: "http://localhost:3000/sellers/" + result._id
                                },
                                requestGetThis: {
                                    type: "GET",
                                    description: "Look at this seller individually",
                                    url: "http://localhost:3000/sellers/" + result._id
                                },
                                deleteRequest: {
                                    type: "DELETE",
                                    description: "Delete the seller",
                                    url: "http://localhost:3000/sellers/" + result._id
                                }
                            }
                        });
                    })
                        .catch(err => {
                        logger_1.logger.error(`Post seller Error while trying to update: ${fast_safe_stringify_1.default(err)}`);
                    });
                }
                else {
                    logger_1.logger.error(`Post seller didnt work due to wrong arguments`);
                    res.status(422).json({
                        message: "You provided unprocessable Data"
                    });
                }
            }
            else {
                logger_1.logger.error(`Update seller failed due to wrong data for the game!)}`);
                res.status(404).json({
                    message: "Game not found"
                });
            }
        });
    }
    findbyid(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Findbyid seller Error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: "Please pass a valid ID"
                    });
                };
            }
            seller_1.default.findById(id)
                .select("label locations headquarter _id game")
                .populate("game")
                .exec()
                .then(doc => {
                if (doc) {
                    res.status(200).json({
                        label: doc.label,
                        locations: doc.locations,
                        headquarter: doc.headquarter,
                        game: doc.game,
                        id: doc._id,
                        deleteRequest: {
                            type: "DELETE",
                            description: "Delete the seller",
                            url: "http://localhost:3000/sellers/" + doc._id
                        }
                    });
                }
                else {
                    logger_1.logger.error(`Findbyid seller did not find a seller!`);
                    res.status(404).json({ message: "No Object found" });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Findbyid seller Error while executing operation: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    patch(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Update seller error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: "Please pass a valid ID"
                    });
                };
            }
            let sellerInstance = yield seller_1.default.findById(id)
                .select("name price platforms _id")
                .exec()
                .then(doc => {
                if (doc) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch(error => {
                logger_1.logger.error(`Update seller error while trying to find the seller: ${fast_safe_stringify_1.default(error)}`);
            });
            if (sellerInstance) {
                const updateOperations = {};
                for (const ops of req.body) {
                    if (!Validator_3.isPropNameSeller(ops.propName) ||
                        !Validator_2.isValidValueSeller(ops.propName, ops.value)) {
                        logger_1.logger.error(`Update seller failed because unprocessable arguments were passed!`);
                        res.status(422).json({
                            message: "Field or Value is not valid"
                        });
                    }
                    updateOperations[ops.propName] = ops.value;
                }
                seller_1.default.update({ _id: id }, { $set: updateOperations })
                    .exec()
                    .then(result => {
                    res.status(200).json({
                        message: "Seller updated",
                        request: {
                            type: "GET",
                            description: "Link to the updated seller",
                            url: "http://localhost:3000/sellers/" + result._id
                        }
                    });
                })
                    .catch(err => {
                    logger_1.logger.error(`Update seller Error while trying to update: ${fast_safe_stringify_1.default(err)}`);
                });
            }
            else {
                logger_1.logger.error(`Update seller did not find a seller!`);
                res.status(404).json({
                    message: "Seller not found"
                });
            }
        });
    }
    del(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                logger_1.logger.error(`Delete seller error because an invalid id was passed`);
                res.status(422).json({
                    message: "Please pass a valid ID"
                });
            }
            seller_1.default.findById(id)
                .exec()
                .then(doc => {
                if (doc) {
                    seller_1.default.deleteOne({ _id: id })
                        .exec()
                        .then(result => {
                        res.status(200).json({
                            message: "Seller deleted"
                        });
                    });
                }
                else {
                    logger_1.logger.error(`Delete seller did not find a seller to delete!`);
                    res.status(404).json({ message: "No Object found" });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Del seller Error while trying to find the seller: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    init() {
        this.router.get("/", this.find);
        this.router.post("/", checkAuth, this.create);
        this.router.get("/:id", this.findbyid);
        this.router.patch("/:id", checkAuth, this.patch);
        this.router.delete("/:id", checkAuth, this.del);
    }
}
exports.SellerRouter = SellerRouter;
const sellerRoutes = new SellerRouter();
sellerRoutes.init();
exports.default = sellerRoutes.router;
