"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const minimist = require("minimist");
const arg = minimist(process.argv.slice(0));
const values = arg._;
const startserver = () => {
    shell.exec("mongod");
};
const stopserver = () => {
    shell.exec('mongo --eval "db.shutdownServer({force: true})" admin');
};
const fillserver = () => {
    shell.exec('mongoimport --db testdb --collection games --drop --file games.json');
    console.log("games filled");
    shell.exec('mongoimport --db testdb --collection sellers --drop --file sellers.json');
    console.log("sellers filled");
};
switch (values[2]) {
    case 'stop':
        stopserver();
        break;
    case 'import':
        fillserver();
        break;
    case 'start':
    default:
        startserver();
}
