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
class GameRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    find(req, res, next) {
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
                                url: 'http://localhost:3000/games/' + doc._id
                            }
                        };
                    })
                };
                if (docs.length > 0) {
                    res.status(200).json(response);
                }
                else {
                    res.status(400).json({
                        message: 'There are no entries'
                    });
                }
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        });
    }
    ;
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = new games_1.default({
                id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                platforms: req.body.platforms,
                price: req.body.price
            });
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
                            url: 'http://localhost:3000/games/' + result._id
                        },
                        request_getthis: {
                            type: 'GET',
                            description: 'Look at this game individually',
                            url: 'http://localhost:3000/games/' + result._id
                        },
                        delete_request: {
                            type: 'DELETE',
                            description: 'Delete the game',
                            url: 'http://localhost:3000/games/' + result._id
                        }
                    }
                });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
        });
    }
    ;
    findbyanything(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.params.anything) {
                res.status(422).json({
                    message: "Please give an argument!"
                });
            }
            let isNumber;
            try {
                parseInt(req.params.anything);
                isNumber = true;
            }
            catch (_a) {
                console.log("Parse to int did not work!");
                isNumber = false;
            }
            let isObjectId;
            try {
                mongoose.Types.ObjectId(req.params.anything);
                isObjectId = true;
            }
            catch (_b) {
                console.log("Parse to ObjectId did not work!");
                isObjectId = false;
            }
            let isPlatform;
            if (["PC", "XBOX", "PS4"].includes(req.body.params)) {
                isPlatform = true;
            }
            else {
                isPlatform = false;
            }
            console.log(isObjectId);
            console.log(isNumber);
            console.log(isPlatform);
            games_1.default.find({ $expr: {
                    $cond: { if: { isObjectId }, then: { _id: req.params.anything }, else: { $cond: { if: { isNumber }, then: { price: req.params.anything }, else: { $cond: { if: { isPlatform }, then: { platforms: req.body.anything }, else: { name: req.params.anything } } } } } }
                }
            })
                .select('-__v')
                .exec()
                .then(doc => {
                if (doc && doc._id != undefined) {
                    res.status(200).json({
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        platforms: doc.platforms,
                        delete_request: {
                            type: 'DELETE',
                            description: 'Delete the game',
                            url: 'http://localhost:3000/games/' + doc._id
                        }
                    });
                }
                else {
                    res.status(404).json({ message: 'No Object found' });
                }
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
        });
    }
    ;
    findbyid(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            games_1.default.findById(id)
                .select('name price platforms _id')
                .exec()
                .then(doc => {
                if (doc) {
                    res.status(200).json({
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        platforms: doc.platforms,
                        delete_request: {
                            type: 'DELETE',
                            description: 'Delete the game',
                            url: 'http://localhost:3000/games/' + doc._id
                        }
                    });
                }
                else {
                    res.status(404).json({ message: 'No Object found' });
                }
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
        });
    }
    ;
    patch(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const updateOperations = {};
            for (const ops of req.body) {
                updateOperations[ops.propName] = ops.value;
            }
            games_1.default.update({ _id: id }, { $set: updateOperations })
                .exec()
                .then(result => {
                res.status(200).json({
                    message: 'Game updated',
                    request: {
                        type: 'GET',
                        description: 'Link to the updated game',
                        url: 'http://localhost:3000/games/' + result._id
                    }
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
    ;
    del(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            games_1.default.deleteOne({ _id: id })
                .exec()
                .then(result => {
                res.status(200).json({
                    message: 'Game deleted'
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
    ;
    init() {
        this.router.get('/', this.find);
        this.router.post('/', this.create);
        this.router.get('/:id', this.findbyid);
        this.router.patch('/:id', this.patch);
        this.router.delete('/:id', this.del);
        this.router.get('/findbyanything/:anything', this.findbyanything);
    }
}
exports.GameRouter = GameRouter;
const gameRoutes = new GameRouter();
gameRoutes.init();
exports.default = gameRoutes.router;
