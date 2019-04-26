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
            const param = req.params.anything;
            console.log(param);
            let objid = "123456789012";
            let isObjectId = false;
            if (mongoose.Types.ObjectId.isValid(param)) {
                objid = mongoose.Types.ObjectId(param);
                isObjectId = true;
            }
            console.log(isObjectId);
            console.log(objid);
            let isNumber = false;
            let number_t = 1234567890;
            if (!isNaN(param) && !isObjectId) {
                number_t = Number(param);
                isNumber = true;
            }
            console.log(isNumber);
            console.log(number_t);
            let isPlatform = false;
            let platform_t = "AAAAA";
            if (["PC", "XBOX", "PS4"].includes(param)) {
                platform_t = param;
                isPlatform = true;
            }
            console.log(isPlatform);
            console.log(platform_t);
            games_1.default.find()
                .or([
                { '_id': objid },
                { 'name': param },
                { 'price': number_t },
                { 'platforms': platform_t }
            ])
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
