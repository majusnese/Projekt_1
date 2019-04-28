import express = require("express");
import GameRouter from "./routes/games";
import SellerRouter from "./routes/seller";
import GeneralRouter from "./routes/general";
import UserRouter from "./routes/user";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import mongoose = require("mongoose");
import * as graphql from "express-graphql";
const graphQlSchema = require("./graphql/schema");
import * as graphQlResolver from './graphql/resolvers';


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
        schema: graphQlSchema,
        rootValue: graphQlResolver,
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
