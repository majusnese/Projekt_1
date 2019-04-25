"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const games_1 = require("./routes/games");
const seller_1 = require("./routes/seller");
const general_1 = require("./routes/general");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const user_1 = require("./routes/user");
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
        this.express.use('/general', general_1.default);
        this.express.use('/user', user_1.default);
    }
    //mongodb://localhost:27017/testdb
    connect() {
        mongoose.connect('mongodb+srv://test:qwertz@noderest-i2sjw.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });
        mongoose.connection.on('connected', () => console.log("database connected"));
        mongoose.connection.on('error', function (error) {
            console.error('Database connection error: ', error);
        });
        let admin = mongoose.connection.db.admin();
        let { version } = admin.serverInfo();
        console.log(`mongodb: ${version}`);
    }
    ;
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
                    message: error.message
                }
            });
            next(error);
        });
    }
}
exports.default = new App().express;
