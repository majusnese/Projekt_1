"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
function init() {
    process.env.JWT_KEY = 'qwertz';
    shell.exec('npm run mongo export');
    shell.exec('npm run mongo importtest');
}
exports.init = init;
