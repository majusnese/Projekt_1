"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, simple, timestamp } = winston_1.format;
const commonFormat = combine(timestamp(), simple());
const { NODE_ENV } = process.env;
const consoleOptions = { level: NODE_ENV === "production" ? "error" : "info" };
const fileOptions = {
    filename: "server.log",
    level: "debug",
    maxsize: 250000,
    maxFiles: 3
};
const { Console, File } = winston_1.transports;
exports.logger = winston_1.createLogger({
    format: commonFormat,
    transports: [new Console(consoleOptions), new File(fileOptions)]
});
if (NODE_ENV === "production") {
    exports.logger.info("Logging durch Winston ist konfiguriert");
}
else {
    exports.logger.debug("Logging durch Winston ist konfiguriert: Level Info");
}
