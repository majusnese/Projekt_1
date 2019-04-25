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
const seller_1 = require("../models/seller");
class GeneralRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const seller_temp = seller_1.default.findById(req.body.seller);
            games_1.default.findById(req.body.game)
                .then(game => {
                if (!game) {
                    const game = new games_1.default({
                        id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        platforms: req.body.platforms,
                        price: req.body.price
                    });
                    game.save();
                }
                if (!seller_temp) {
                    const seller = new seller_1.default({
                        id: new mongoose.Types.ObjectId(),
                        label: req.body.label,
                        locations: req.body.locations,
                        headquarter: req.body.headquarter,
                        game: req.body.game
                    });
                    seller.save();
                }
                res.status(201).json({
                    message: 'worked'
                });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
        });
    }
    ;
    init() {
        this.router.post('/', this.create);
    }
}
exports.GeneralRouter = GeneralRouter;
const generalRoutes = new GeneralRouter();
generalRoutes.init();
exports.default = generalRoutes.router;
