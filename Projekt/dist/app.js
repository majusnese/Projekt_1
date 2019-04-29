"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const games_1 = require("./routes/games");
const seller_1 = require("./routes/seller");
const user_1 = require("./routes/user");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphql = require("express-graphql");
const graphQlSchema = require('./graphql/schema');
const graphQlResolver = require("./graphql/resolvers");
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
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'PUT, PATCH, DELETE, GET');
                return res.status(200).json({});
            }
            next();
        });
    }
    //routes that delegate the requests to the routers
    routes() {
        this.express.use('/games', games_1.default);
        this.express.use('/sellers', seller_1.default);
        this.express.use('/user', user_1.default);
        //GraphQl for providing a Query to the Client
        this.express.use('/graphql', graphql({
            schema: graphQlSchema,
            rootValue: graphQlResolver,
            graphiql: true,
        }));
    }
    //mongodb+srv://test:qwertz@noderest-i2sjw.mongodb.net/rest?retryWrites=true
    connect() {
        mongoose.connect('mongodb://localhost:27017/testdb', {
            useNewUrlParser: true,
        });
        mongoose.connection.on('connected', () => console.log('database connected'));
        mongoose.connection.on('error', function (error) {
            console.error('Database connection error: ', error);
        });
        mongoose.set('useCreateIndex', true);
    }
    errorNF() {
        this.express.use(function (req, res, next) {
            const error = new Error('Not found');
            res.status(404);
            next(error);
        });
    }
    errorINT() {
        this.express.use(function (req, res, next) {
            const error = new Error('Internal Server Error');
            res.status(500);
            res.json({
                error: {
                    message: error.message,
                },
            });
            next(error);
        });
    }
}
exports.default = new App().express;
