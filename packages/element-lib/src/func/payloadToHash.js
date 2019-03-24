const base64url = require('base64url');
const crypto = require('crypto');

module.exports = (payload) => {
  const encodedPayload = base64url.encode(Buffer.from(JSON.stringify(payload)));
  return base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(encodedPayload))
      .digest(),
  );
};
