"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const minimist = require("minimist");
const arg = minimist(process.argv.slice(0));
const values = arg._;
const startserver = () => {
    shell.exec('mongod');
};
const stopserver = () => {
    shell.exec('mongo --eval "db.shutdownServer({force: true})" admin');
};
const fillservertest = () => {
    shell.exec('mongoimport --db testdb --collection games --drop --file games.json');
    console.log('games filled');
    shell.exec('mongoimport --db testdb --collection sellers --drop --file sellers.json');
    console.log('sellers filled');
};
const exportall = () => {
    shell.exec('mongoexport --db testdb --collection games --out games_export.json');
    shell.exec('mongoexport --db testdb --collection sellers --out sellers_export.json');
    shell.exec('mongoexport --db testdb --collection users --out users_export.json');
};
const fillserverback = () => {
    shell.exec('mongoimport --db testdb --collection games --drop --file games_export.json');
    console.log('games filled');
    shell.exec('mongoimport --db testdb --collection sellers --drop --file sellers_export.json');
    console.log('sellers filled');
    shell.exec('mongoimport --db testdb --collection users --drop --file users_export.json');
    console.log('users filled');
};
switch (values[2]) {
    case 'export':
        exportall();
        break;
    case 'stop':
        stopserver();
        break;
    case 'importbackup':
        fillserverback();
        break;
    case 'importtest':
        fillservertest();
        break;
    case 'start':
    default:
        startserver();
}
