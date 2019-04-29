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
const games_1 = require("../models/games");
const mongoose = require("mongoose");
const Validator_1 = require("../utils/Validator");
const checkAuth = require('../utils/check-auth');
const logger_1 = require("../utils/logger");
const fast_safe_stringify_1 = require("fast-safe-stringify");
const Validator_2 = require("../utils/Validator");
const Validator_3 = require("../utils/Validator");
class GameRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    find(res) {
        return __awaiter(this, void 0, void 0, function* () {
            games_1.default.find()
                .select('name price _id platforms')
                .exec()
                .then(docs => {
                const response = {
                    count: docs.length,
                    games: docs.map(doc => {
                        return {
                            name: doc.name,
                            price: doc.price,
                            _id: doc._id,
                            request: {
                                type: 'GET',
                                description: 'The link matching the request',
                                url: 'http://localhost:3000/games/' + doc._id,
                            },
                        };
                    }),
                };
                if (docs.length > 0) {
                    res.status(200).json(response);
                }
                else {
                    logger_1.logger.debug(`findall did not find entries:`);
                    res.status(404).json({
                        message: 'There are no entries',
                    });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Findall game error while trying to execute operation: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    //422: unprocessable Entity
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = new games_1.default({
                id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                platforms: req.body.platforms,
                price: req.body.price,
            });
            if (Validator_1.isGame(game)) {
                game.save()
                    .then(result => {
                    res.status(201).json({
                        message: 'Post request successful to /games',
                        createdGame: {
                            name: result.name,
                            price: result.price,
                            platforms: result.platforms,
                            _id: result._id,
                            request: {
                                type: 'GET',
                                description: 'Look at the created game',
                                url: 'http://localhost:3000/games/' + result._id,
                            },
                            requestGetThis: {
                                type: 'GET',
                                description: 'Look at this game individually',
                                url: 'http://localhost:3000/games/' + result._id,
                            },
                            deleteRequest: {
                                type: 'DELETE',
                                description: 'Delete the game',
                                url: 'http://localhost:3000/games/' + result._id,
                            },
                        },
                    });
                })
                    .catch(err => {
                    logger_1.logger.error(`Post game error whily trying to execute operation: ${fast_safe_stringify_1.default(err)}`);
                });
            }
            else {
                logger_1.logger.error(`Post game was not succesful due to wrong data`);
                res.status(422).json({
                    message: 'please provide proper data',
                });
            }
        });
    }
    findbyanything(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.params.anything) {
                logger_1.logger.error(`findbyanything did not get an argument`);
                res.status(422).json({
                    message: 'Please give an argument!',
                });
            }
            const param = req.params.anything;
            let isString = false;
            if (typeof param === 'string') {
                isString = true;
            }
            let objid = '123456789012';
            let isObjectId = false;
            if (mongoose.Types.ObjectId.isValid(param)) {
                objid = mongoose.Types.ObjectId(param);
                isObjectId = true;
            }
            let isNumber = false;
            let numberTest = 1234567890;
            if (!isNaN(param) && !isObjectId) {
                numberTest = Number(param);
                isNumber = true;
            }
            let isPlatform = false;
            let platformTest = 'AAAAA';
            if (['PC', 'XBOX', 'PS4'].includes(param)) {
                platformTest = param;
                isPlatform = true;
            }
            if (!isNumber && !isObjectId && !isPlatform && !isString) {
                logger_1.logger.error(`findbyanything error because unprocessable arguments were passed`);
                res.status(422).json({
                    message: 'Argument could not be processed',
                });
            }
            yield games_1.default.find()
                .or([{ _id: objid }, { name: param }, { price: numberTest }, { platforms: platformTest }])
                .exec()
                .then(docs => {
                const response = {
                    count: docs.length,
                    games: docs.map(doc => {
                        return {
                            name: doc.name,
                            price: doc.price,
                            _id: doc._id,
                            platforms: doc.platforms,
                            request: {
                                type: 'GET',
                                description: 'The link matching the request',
                                url: 'http://localhost:3000/games/' + doc._id,
                            },
                        };
                    }),
                };
                if (docs.length > 0) {
                    res.status(200).json(response);
                }
                else {
                    logger_1.logger.error(`findbyanything did not find entries:`);
                    res.status(404).json({
                        message: 'There are no entries',
                    });
                }
            })
                .catch(err => {
                logger_1.logger.error(`findbyanything game error while trying to execute operation: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    findbyid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Findbyid game error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: 'Please pass a valid ID',
                    });
                };
            }
            yield games_1.default.findById(id)
                .select('name price platforms _id')
                .exec()
                .then(doc => {
                if (doc) {
                    res.status(200).json({
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        platforms: doc.platforms,
                        deleteRequest: {
                            type: 'DELETE',
                            description: 'Delete the game',
                            url: 'http://localhost:3000/games/' + doc._id,
                        },
                    });
                }
                else {
                    logger_1.logger.error(`No Game found`);
                    res.status(404).json({ message: 'No Object found' });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Findbyid game error whily trying to findbyid: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    patch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Update game error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: 'Please pass a valid ID',
                    });
                };
            }
            let gameInstance = yield games_1.default.findById(id)
                .select('name price platforms _id')
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
                logger_1.logger.error(`Update game failed while trying to find the game: ${fast_safe_stringify_1.default(error)}`);
            });
            if (gameInstance) {
                const updateOperations = {};
                for (const ops of req.body) {
                    if (!Validator_3.isPropName(ops.propName) || !Validator_2.isValidValue(ops.propName, ops.value)) {
                        logger_1.logger.error(`Update game failed, wrong arguments`);
                        res.status(422).json({
                            message: 'Field or Value is not valid',
                        });
                    }
                    updateOperations[ops.propName] = ops.value;
                }
                games_1.default.update({ _id: id }, { $set: updateOperations })
                    .exec()
                    .then(() => {
                    res.status(200).json({
                        message: 'Game updated',
                        request: {
                            type: 'GET',
                            description: 'Link to the updated game',
                            url: 'http://localhost:3000/games/' + id,
                        },
                    });
                })
                    .catch(err => {
                    logger_1.logger.error(`Update game Error while trying to update: ${fast_safe_stringify_1.default(err)}`);
                });
            }
            else {
                logger_1.logger.error(`No Game to update`);
                res.status(404).json({
                    message: 'Game not found',
                });
            }
        });
    }
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            try {
                id = mongoose.Types.ObjectId(req.params.id);
            }
            catch (_a) {
                err => {
                    logger_1.logger.error(`Delete game Error because an invalid id was passed: ${fast_safe_stringify_1.default(err)}`);
                    res.status(422).json({
                        message: 'Please pass a valid ID',
                    });
                };
            }
            games_1.default.findById(id)
                .exec()
                .then(doc => {
                if (doc) {
                    games_1.default.deleteOne({ _id: id })
                        .exec()
                        .then(result => {
                        if (result) {
                            res.status(200).json({
                                message: 'Game deleted',
                            });
                        }
                    })
                        .catch(err => {
                        logger_1.logger.error(`Delete game Error while trying to delete the Game: ${fast_safe_stringify_1.default(err)}`);
                    });
                }
                else {
                    logger_1.logger.error(`No Game to delete`);
                    res.status(404).json({ message: 'No Object found' });
                }
            })
                .catch(err => {
                logger_1.logger.error(`Delete game Error while trying to find the Game: ${fast_safe_stringify_1.default(err)}`);
            });
        });
    }
    init() {
        this.router.get('/', this.find);
        this.router.post('/', checkAuth, this.create);
        this.router.get('/:id', this.findbyid);
        this.router.patch('/:id', checkAuth, this.patch);
        this.router.delete('/:id', checkAuth, this.del);
        this.router.get('/findbyanything/:anything', this.findbyanything);
    }
}
exports.GameRouter = GameRouter;
const gameRoutes = new GameRouter();
gameRoutes.init();
exports.default = gameRoutes.router;
