const winston = require('winston');

// Imports the Google Cloud client library for Winston
// const { LoggingWinston } = require('@google-cloud/logging-winston');

// const projectId = 'element-did';
// const loggingWinston = new LoggingWinston({ projectId });

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"

const transports = [new winston.transports.Console()];
let level = 'info';

if (process.env.NODE_ENV === 'test') {
  // Disable logs in tests
  level = 'error';
} else {
  level = 'info';
}

const logger = winston.createLogger({
  level,
  transports,
});

module.exports = logger;
