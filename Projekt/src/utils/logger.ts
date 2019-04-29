import { createLogger, format, transports } from "winston";

const { combine, simple, timestamp } = format;

const commonFormat = combine(timestamp(), simple());

const { NODE_ENV } = process.env;
const consoleOptions = { level: NODE_ENV === "production" ? "error" : "info" };
const fileOptions = {
  filename: "server.log",
  level: "debug",
  maxsize: 250000,
  maxFiles: 3
};

const { Console, File } = transports;
export const logger = createLogger({
  format: commonFormat,
  transports: [new Console(consoleOptions), new File(fileOptions)]
});

if (NODE_ENV === "production") {
  logger.info("Logging durch Winston ist konfiguriert");
} else {
  logger.debug("Logging durch Winston ist konfiguriert: Level Info");
}
