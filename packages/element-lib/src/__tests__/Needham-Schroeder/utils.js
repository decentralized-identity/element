const crypto = require('crypto');
// eslint-disable-next-line
const { generateKeyPair } = require('crypto');
const jwt = require('jsonwebtoken');

const generateKey = () => new Promise((resolve, reject) => {
  generateKeyPair(
    'rsa',
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        // cipher: 'aes-256-cbc',
        // passphrase: 'top secret',
      },
    },
    (err, publicKey, privateKey) => {
      // Handle errors and use the generated key pair.
      if (err) {
        return reject(err);
      }
      return resolve({ publicKey, privateKey });
    },
  );
});

const encrypt = (publicKey, dataBuffer) => {
  const encrypted = crypto.publicEncrypt(publicKey, dataBuffer).toString('base64');
  return encrypted;
};

const decrypt = (privateKey, base64EncodedBuffer) => {
  const plaintext = crypto.privateDecrypt(privateKey, Buffer.from(base64EncodedBuffer, 'base64'));
  return JSON.parse(plaintext);
};

const i = 'Mysoft corp'; // Issuer
const s = 'some@user.com'; // Subject
const a = 'https://element-did.com'; // Audience

const makeToken = (privateKey) => {
  // PAYLOAD
  const payload = {
    data1: 'Data 1',
    data2: 'Data 2',
    data3: 'Data 3',
    data4: 'Data 4',
  };

  // SIGNING OPTIONS
  const signOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '1h',
    algorithm: 'RS256',
  };
  return jwt.sign(payload, privateKey, signOptions);
};

const verifyToken = (token, publicKey) => {
  const verifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '12h',
    algorithm: ['RS256'],
  };

  return jwt.verify(token, publicKey, verifyOptions);
};

module.exports = {
  generateKey,
  makeToken,
  verifyToken,
  encrypt,
  decrypt,
};
