import express = require("express");
import GameRouter from "./routes/games";
import SellerRouter from "./routes/seller";
import GeneralRouter from "./routes/general";
import UserRouter from "./routes/user";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import mongoose = require("mongoose");
import * as graphql from "express-graphql";
const { buildSchema } = require("graphql");
import Game from "./models/games";
import Seller from "./models/seller";
import User from "./models/user";

class App {
  public express: express.Application;

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
  private middleware(): void {
    this.express.use(logger("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, GET");
        return res.status(200).json({});
      }
      next();
    });
  }

  //routes that delegate the requests to the routers
  private routes(): void {
    this.express.use("/games", GameRouter);
    this.express.use("/sellers", SellerRouter);
    this.express.use("/general", GeneralRouter);
    this.express.use("/user", UserRouter);

    //GraphQl for providing a Query to the Client
    this.express.use(
      "/graphql",
      graphql({
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

            type User {
              _id: ID!
              name: String
              email: String!
            }

            input UserInput {
              email: String!
              password: String!
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
                createUser(userInput: UserInput) : User
            }

            schema {
              query: RootQuery
              mutation: RootMutation
            }
        `),
        rootValue: {
          games: () => {
            return Game.find()
              .then(games => {
                return games.map(game => {
                  return { ...game._doc };
                });
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          sellers: () => {
            return Seller.find()
              .then(sellers => {
                return sellers.map(seller => {
                  return { ...seller._doc };
                });
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          seller: (args) => {
            return Seller.findById(args.id)
              .then(seller => {
                return seller;
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          game: (args) => {
            return Game.findById(args.id)
              .then(game => {
                return game;
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          createSeller: (args) => {
            const seller_instance = new Seller({
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
                return { ...result._doc };
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          createGame: (args) => {
            const game_instance = new Game({
              id: new mongoose.Types.ObjectId(),
              name: args.gameInput.name,
              platforms: args.gameInput.platforms,
              price: args.gameInput.price
            });
            return game_instance
              .save()
              .then(result => {
                console.log(result);
                return { ...result._doc };
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          },
          createUser: (args) => {
            const user_instance = new User({
              id: new mongoose.Types.ObjectId(),
              name: args.userInput.name,
              password: args.userInput.password,
              email: args.userInput.email
            });
            return user_instance
              .save()
              .then(result => {
                console.log(result);
                return { ...result._doc, password: "*********" };
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          }
        },
        graphiql: true
      })
    );
  }

  //mongodb+srv://test:qwertz@noderest-i2sjw.mongodb.net/rest?retryWrites=true
  private connect(): void {
    mongoose.connect("mongodb://localhost:27017/testdb", {
      useNewUrlParser: true
    });
    mongoose.connection.on("connected", () =>
      console.log("database connected")
    );
    mongoose.connection.on("error", function(error) {
      console.error("Database connection error: ", error);
    });
  }

  private errorNF(): void {
    this.express.use(function(req, res, next) {
      const error = new Error("Not found");
      res.status(404);
      next(error);
    });
  }

  private errorINT(): void {
    this.express.use(function(req, res, next) {
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
export default new App().express;
