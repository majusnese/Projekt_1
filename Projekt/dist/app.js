"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const games_1 = require("./routes/games");
const seller_1 = require("./routes/seller");
const general_1 = require("./routes/general");
const user_1 = require("./routes/user");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphql = require("express-graphql");
const { buildSchema } = require("graphql");
const games_2 = require("./models/games");
const seller_2 = require("./models/seller");
class App {
    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.errorNF();
        this.errorINT();
        this.connect();
    }
    //Middleware Logger von Morgan
    //Bodyparser um Body Zugriff zu erleichtern
    //Cors error vermeiden, zugriff von anderen orten
    middleware() {
        this.express.use(logger("dev"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            if (req.method === "OPTIONS") {
                res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, GET");
                return res.status(200).json({});
            }
            next();
        });
    }
    //routes that delegate the requests to the routers
    routes() {
        this.express.use("/games", games_1.default);
        this.express.use("/sellers", seller_1.default);
        this.express.use("/general", general_1.default);
        this.express.use("/user", user_1.default);
        //GraphQl for providing a Query to the Client
        this.express.use("/graphql", graphql({
            schema: buildSchema(`
            type Game {
              _id: ID!
              name: String!
              price: Float!
              platforms: [String]
            }

            type Seller {
              _id: ID!
              label: String!
              locations: Int!
              headquarter: String!
              game: ID!
            }

            input SellerInput {
              label: String!
              locations: Int!
              headquarter: String!
              game: ID!
            }
            input GameInput {
              name: String! 
              price: Float!
              platforms: [String]
            }

            type RootQuery {
                games: [Game!]!
                sellers: [Seller!]!
                game(id: ID): Game!
                seller(id: ID): Seller!
            }

            type RootMutation {
                createGame(gameInput: GameInput) : Game
                createSeller(sellerInput: SellerInput) : Seller
            }

            schema {
              query: RootQuery
              mutation: RootMutation
            }
        `),
            rootValue: {
                games: () => {
                    return games_2.default.find()
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
                    return seller_2.default.find()
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
                seller: (args) => {
                    return seller_2.default.findById(args.id)
                        .then(seller => {
                        return seller;
                    })
                        .catch(err => {
                        console.log(err);
                        throw err;
                    });
                },
                game: (args) => {
                    return games_2.default.findById(args.id)
                        .then(game => {
                        return game;
                    })
                        .catch(err => {
                        console.log(err);
                        throw err;
                    });
                },
                createSeller: (args) => {
                    const seller_instance = new seller_2.default({
                        id: new mongoose.Types.ObjectId(),
                        label: args.sellerInput.label,
                        headquarter: args.sellerInput.headquarter,
                        locations: args.sellerInput.locations,
                        game: args.sellerInput.game
                    });
                    return seller_instance
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
                createGame: (args) => {
                    const game_instance = new games_2.default({
                        id: new mongoose.Types.ObjectId(),
                        name: args.gameInput.name,
                        platforms: args.gameInput.platforms,
                        price: args.gameInput.price
                    });
                    return game_instance
                        .save()
                        .then(result => {
                        console.log(result);
                        return Object.assign({}, result._doc);
                    })
                        .catch(err => {
                        console.log(err);
                        throw err;
                    });
                }
            },
            graphiql: true
        }));
    }
    //mongodb+srv://test:qwertz@noderest-i2sjw.mongodb.net/rest?retryWrites=true
    connect() {
        mongoose.connect("mongodb://localhost:27017/testdb", {
            useNewUrlParser: true
        });
        mongoose.connection.on("connected", () => console.log("database connected"));
        mongoose.connection.on("error", function (error) {
            console.error("Database connection error: ", error);
        });
    }
    errorNF() {
        this.express.use(function (req, res, next) {
            const error = new Error("Not found");
            res.status(404);
            next(error);
        });
    }
    errorINT() {
        this.express.use(function (req, res, next) {
            const error = new Error("Internal Server Error");
            res.status(500);
            res.json({
                error: {
                    message: error.message
                }
            });
            next(error);
        });
    }
}
exports.default = new App().express;
