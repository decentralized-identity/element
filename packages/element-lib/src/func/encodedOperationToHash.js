const base64url = require('base64url');
const crypto = require('crypto');

module.exports = encodedOperation => base64url.encode(
  crypto
    .createHash('sha256')
    .update(base64url.toBuffer(encodedOperation))
    .digest(),
);
