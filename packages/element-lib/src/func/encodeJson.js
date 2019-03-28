const base64url = require('base64url');

module.exports = payload => base64url.encode(Buffer.from(JSON.stringify(payload)));
