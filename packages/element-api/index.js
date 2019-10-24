const functions = require('firebase-functions');

const app = require('./src/express/app');

// Expose Express API as a single Cloud Function:
exports.main = functions.https.onRequest(app);
