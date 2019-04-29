"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const games_1 = require("../../models/games");
const seller_1 = require("../../models/seller");
const user_1 = require("../../models/user");
const mongoose = require("mongoose");
module.exports = {
    games: () => {
        return games_1.default.find()
            .then(games => {
            return games.map(game => {
                return Object.assign({}, game._doc);
            });
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    sellers: () => {
        return seller_1.default.find()
            .then(sellers => {
            return sellers.map(seller => {
                return Object.assign({}, seller._doc);
            });
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    seller: args => {
        return seller_1.default.findById(args.id)
            .then(seller => {
            return seller;
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    game: args => {
        return games_1.default.findById(args.id)
            .then(game => {
            return game;
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    createSeller: args => {
        const sellerInstance = new seller_1.default({
            id: new mongoose.Types.ObjectId(),
            label: args.sellerInput.label,
            headquarter: args.sellerInput.headquarter,
            locations: args.sellerInput.locations,
            game: args.sellerInput.game
        });
        return sellerInstance
            .save()
            .then(result => {
            console.log(result);
            return Object.assign({}, result._doc);
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    createGame: args => {
        const gameInstance = new games_1.default({
            id: new mongoose.Types.ObjectId(),
            name: args.gameInput.name,
            platforms: args.gameInput.platforms,
            price: args.gameInput.price
        });
        return gameInstance
            .save()
            .then(result => {
            console.log(result);
            return Object.assign({}, result._doc);
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    },
    createUser: args => {
        const userInstance = new user_1.default({
            id: new mongoose.Types.ObjectId(),
            name: args.userInput.name,
            password: args.userInput.password,
            email: args.userInput.email
        });
        return userInstance
            .save()
            .then(result => {
            console.log(result);
            return Object.assign({}, result._doc, { password: "*********" });
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    }
};
