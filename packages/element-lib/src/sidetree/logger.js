/* eslint-disable no-param-reassign */
const winston = require('winston');

const initLogger = sidetree => {
  const { logLevel } = sidetree.parameters;
  const winstonLevels = Object.keys(winston.config.npm.levels);
  if (logLevel && !winstonLevels.includes(logLevel)) {
    throw new Error('invalid logLevel value');
  }
  const logger = winston.createLogger({
    // By default, we have the most open log level
    level: logLevel || 'silly',
    transports: [new winston.transports.Console()],
  });
  sidetree.logger = logger;
  if (sidetree.blockchain) {
    sidetree.blockchain.logger = logger;
  }
  if (sidetree.storage) {
    sidetree.storage.logger = logger;
  }
};

module.exports = initLogger;
