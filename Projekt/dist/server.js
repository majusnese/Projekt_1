"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const App_1 = require("./App");
const debug = require("debug");
debug('ts-express:server');
const server = http.createServer(App_1.default);
function normalizePort(val) {
    let port = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(port))
        return val;
    else if (port >= 0)
        return port;
    else
        return false;
}
const port = normalizePort(3000);
function onError(error) {
    if (error.syscall !== 'listen')
        throw error;
    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}
App_1.default.set('port', port);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
