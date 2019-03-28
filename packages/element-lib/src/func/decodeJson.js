const base64url = require('base64url');

module.exports = encodedPayload => JSON.parse(base64url.decode(encodedPayload));
