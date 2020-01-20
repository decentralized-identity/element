const crypto = require('crypto');
// eslint-disable-next-line
const jwt = require('jsonwebtoken');
// eslint-disable-next-line
const { generateKeyPair } = require('crypto');

const aud = 'https://element-did.com';
const getAuthKey = didDoc =>
  didDoc.publicKey.find(k => k.id === `${didDoc.id}#auth`);

const generateKey = () =>
  new Promise((resolve, reject) => {
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
      }
    );
  });

const createM0 = async ({
  resolve,
  initiatorDid,
  responderDid,
  initiatorPrivateKey,
}) => {
  const initiatorDidDoc = await resolve(initiatorDid);
  const responderDidDoc = await resolve(responderDid);
  const initiatorAuthKey = getAuthKey(initiatorDidDoc);
  const responderDidAuthKey = getAuthKey(responderDidDoc);

  const Na = crypto.randomBytes(32).toString('hex');
  const dataBuffer = Buffer.from(
    JSON.stringify({
      Na,
    })
  );
  const token = jwt.sign(
    {
      protocolMessage: 'm0',
      from: initiatorAuthKey.id,
      to: responderDidAuthKey.id,
      message: crypto
        .publicEncrypt(responderDidAuthKey.publicKeyPem, dataBuffer)
        .toString('base64'),
    },
    initiatorPrivateKey,
    {
      issuer: initiatorDid,
      subject: responderDid,
      audience: aud,
      expiresIn: '1h',
      algorithm: 'RS256',
    }
  );

  return {
    m0: token,
    Na,
  };
};

const createM1 = async ({
  resolve,
  m0,
  initiatorDid,
  responderDid,
  responderPrivateKey,
}) => {
  const decoded = jwt.decode(m0);
  if (decoded.protocolMessage !== 'm0') {
    throw new Error(`Wrong protocolMessage ${decoded.protocolMessage}`);
  }
  if (initiatorDid !== decoded.iss) {
    throw new Error('initiatorDid must be iss for m0');
  }
  if (responderDid !== decoded.sub) {
    throw new Error('responderDid must be sub for m0');
  }
  const initiatorDidDoc = await resolve(initiatorDid);
  const responderDidDoc = await resolve(responderDid);
  const initiatorAuthKey = getAuthKey(initiatorDidDoc);
  const responderDidAuthKey = getAuthKey(responderDidDoc);

  const verified = jwt.verify(m0, initiatorAuthKey.publicKeyPem, {
    issuer: initiatorDid,
    subject: responderDid,
    audience: aud,
    expiresIn: '1hr',
    algorithm: ['RS256'],
  });
  const decrypted = JSON.parse(
    crypto
      .privateDecrypt(
        responderPrivateKey,
        Buffer.from(verified.message, 'base64')
      )
      .toString()
  );
  if (!decrypted.Na) {
    throw new Error('Na must be present in m0.message');
  }
  const Nb = crypto.randomBytes(32).toString('hex');
  const dataBuffer = Buffer.from(
    JSON.stringify({
      Nb,
      Na: decrypted.Na,
      did: responderDid,
    })
  );

  const m1 = jwt.sign(
    {
      from: responderDidAuthKey.id,
      to: initiatorAuthKey.id,
      protocolMessage: 'm1',
      message: crypto
        .publicEncrypt(initiatorAuthKey.publicKeyPem, dataBuffer)
        .toString('base64'),
    },
    responderPrivateKey,
    {
      issuer: responderDid,
      subject: initiatorDid,
      audience: aud,
      expiresIn: '1h',
      algorithm: 'RS256',
    }
  );

  return {
    Nb,
    m1,
  };
};

const createM2 = async ({
  resolve,
  m1,
  initiatorDid,
  responderDid,
  initiatorPrivateKey,
  Na,
}) => {
  const decoded = jwt.decode(m1);
  if (decoded.protocolMessage !== 'm1') {
    throw new Error(`Wrong protocolMessage ${decoded.protocolMessage}`);
  }
  if (responderDid !== decoded.iss) {
    throw new Error('responderDid must be iss for m1');
  }
  if (initiatorDid !== decoded.sub) {
    throw new Error('initiatorDid must be sub for m1');
  }

  const initiatorDidDoc = await resolve(initiatorDid);
  const responderDidDoc = await resolve(responderDid);
  const initiatorAuthKey = getAuthKey(initiatorDidDoc);
  const responderDidAuthKey = getAuthKey(responderDidDoc);

  // Note that we use the resolver to verify the issuer key.
  const verified = jwt.verify(m1, responderDidAuthKey.publicKeyPem, {
    issuer: responderDid,
    subject: initiatorDid,
    audience: aud,
    expiresIn: '1hr',
    algorithm: ['RS256'],
  });

  const decrypted = JSON.parse(
    crypto
      .privateDecrypt(
        initiatorPrivateKey,
        Buffer.from(verified.message, 'base64')
      )
      .toString()
  );
  if (decrypted.Na !== Na) {
    throw new Error('m1 contained incorrect Na.');
  }
  if (!decrypted.Nb) {
    throw new Error('m1 did not contain Nb.');
  }
  if (decrypted.did !== responderDid) {
    throw new Error('m1 message.did must be responderDid.');
  }

  // Alice has authenticated Bob.

  const dataBuffer = Buffer.from(
    JSON.stringify({
      Nb: decrypted.Nb,
    })
  );
  const m2 = jwt.sign(
    {
      from: initiatorAuthKey.id,
      to: responderDidAuthKey.id,
      protocolMessage: 'm2',
      message: crypto
        .publicEncrypt(responderDidAuthKey.publicKeyPem, dataBuffer)
        .toString('base64'),
    },
    initiatorPrivateKey,
    {
      issuer: initiatorDid,
      subject: responderDid,
      audience: aud,
      expiresIn: '1h',
      algorithm: 'RS256',
    }
  );

  return {
    m2,
    Na: decrypted.Na,
    Nb: decrypted.Nb,
  };
};

const verifyM2 = async ({
  m2,
  resolve,
  initiatorDid,
  responderDid,
  responderPrivateKey,
  Nb,
}) => {
  const decoded = jwt.decode(m2);
  if (decoded.protocolMessage !== 'm2') {
    throw new Error(`Wrong protocolMessage ${decoded.protocolMessage}`);
  }
  if (initiatorDid !== decoded.iss) {
    throw new Error('initiatorDid must be iss for m2');
  }
  if (responderDid !== decoded.sub) {
    throw new Error('responderDid must be sub for m2');
  }
  const initiatorDidDoc = await resolve(decoded.iss);
  const initiatorAuthKey = getAuthKey(initiatorDidDoc);
  const verified = jwt.verify(m2, initiatorAuthKey.publicKeyPem, {
    issuer: initiatorDid,
    subject: responderDid,
    audience: aud,
    expiresIn: '1hr',
    algorithm: ['RS256'],
  });

  const decrypted = JSON.parse(
    crypto
      .privateDecrypt(
        responderPrivateKey,
        Buffer.from(verified.message, 'base64')
      )
      .toString()
  );
  if (decrypted.Nb !== Nb) {
    throw new Error('m2 contained incorrect Nb.');
  }
  return true;
};

module.exports = {
  generateKey,
  createM0,
  createM1,
  createM2,
  verifyM2,
};
