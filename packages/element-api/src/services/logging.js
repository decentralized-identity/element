const winston = require('winston');

// Imports the Google Cloud client library for Winston
// const { LoggingWinston } = require('@google-cloud/logging-winston');

// const projectId = 'element-did';
// const loggingWinston = new LoggingWinston({ projectId });

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"

const transports = [];

if (process.env.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console());
}

if (process.env.NODE_ENV === 'production') {
  // Add Stackdriver Logging
  // transports.push(loggingWinston);
}

const logger = winston.createLogger({
  level: 'info',
  transports,
});

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
