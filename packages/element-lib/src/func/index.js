/* eslint-disable arrow-body-style */
const base64url = require('base64url');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const multihashes = require('multihashes');
const Unixfs = require('ipfs-unixfs');
const { DAGNode, util } = require('ipld-dag-pb');

// This function applies f, an async function, sequentially to an array of values
// We need it because:
//   - Promise.all executes all promises at the same time instead of sequentially
//   - for loop with await is very bad apparently
// Adapted from: https://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
const executeSequentially = (f, array) => {
  return array.reduce((promise, value) => {
    return promise.then(() => f(value));
  }, Promise.resolve());
};

const encodeJson = payload =>
  base64url.encode(Buffer.from(JSON.stringify(payload)));

const decodeJson = encodedPayload =>
  JSON.parse(base64url.decode(encodedPayload));

const payloadToHash = payload => {
  const encodedPayload = encodeJson(payload);
  const encodedOperationPayloadBuffer = Buffer.from(encodedPayload);
  const hash = crypto
    .createHash('sha256')
    .update(encodedOperationPayloadBuffer)
    .digest();
  const hashAlgorithmName = multihashes.codes[18]; // 18 is code for sha256
  const multihash = multihashes.encode(hash, hashAlgorithmName);
  const encodedMultihash = base64url.encode(multihash);
  return encodedMultihash;
};

const getDidUniqueSuffix = operation => {
  const header = decodeJson(operation.protected);
  switch (header.operation) {
    case 'create':
      return payloadToHash(operation.payload);
    case 'update':
    case 'recover':
    case 'delete':
      return decodeJson(operation.payload).didUniqueSuffix;
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${operation}`);
  }
};

const batchFileToOperations = batchFile =>
  batchFile.operations.map(op => {
    const decodedOperation = decodeJson(op);
    const operationHash = payloadToHash(decodedOperation.payload);
    const decodedOperationPayload = decodeJson(decodedOperation.payload);
    const decodedHeader = decodeJson(decodedOperation.protected);
    return {
      operationHash,
      decodedOperation,
      decodedOperationPayload,
      decodedHeader,
    };
  });

const readThenWriteToCache = async (sidetree, hash) => {
  const cachedRecord = await sidetree.db.read(hash);
  let record;
  if (!cachedRecord) {
    record = await sidetree.storage.read(hash);
    await sidetree.db.write(hash, record);
  } else {
    record = cachedRecord;
  }
  return record;
};

// TODO check is signatures are the same as sidetree's
const signEncodedPayload = (encodedHeader, encodedPayload, privateKey) => {
  const toBeSigned = `${encodedHeader}.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const signatureObject = secp256k1.sign(hash, privateKeyBuffer);
  const signature = base64url.encode(signatureObject.signature);
  return signature;
};

const verifyOperationSignature = (
  encodedHeader,
  encodedPayload,
  signature,
  publicKey
) => {
  const toBeVerified = `${encodedHeader}.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeVerified))
    .digest();
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  return secp256k1.verify(hash, base64url.toBuffer(signature), publicKeyBuffer);
};

const base58EncodedMultihashToBytes32 = base58EncodedMultihash =>
  `0x${multihashes
    .toHexString(multihashes.fromB58String(base58EncodedMultihash))
    .substring(4)}`;

const bytes32EnodedMultihashToBase58EncodedMultihash = bytes32EncodedMultihash =>
  multihashes.toB58String(
    multihashes.fromHexString(
      `1220${bytes32EncodedMultihash.replace('0x', '')}`
    )
  );

const objectToUnixFsBuffer = object => {
  const objectBuffer = Buffer.from(JSON.stringify(object));
  const unixFs = new Unixfs('file', objectBuffer);
  const unixFsFileBuffer = unixFs.marshal();
  return unixFsFileBuffer;
};

const objectToMultihash = async object => {
  const unixFsFileBuffer = objectToUnixFsBuffer(object);
  return new Promise((resolve, reject) => {
    DAGNode.create(unixFsFileBuffer, (createErr, node1) => {
      if (createErr) {
        reject(createErr);
      }
      util.cid(node1, (err, cid) => {
        if (err) {
          reject(err);
        }
        resolve(multihashes.toB58String(cid.multihash));
      });
    });
  });
};

const toFullyQualifiedDidDocument = didDocument => {
  const did = didDocument.id;
  const stringified = JSON.stringify(didDocument);
  const expanded = stringified.replace(/"#/g, `"${did}#`);
  return JSON.parse(expanded);
};

const getOrderedOperations = operations => {
  const orderedOperations = [...operations];
  orderedOperations.sort(
    (op1, op2) =>
      op1.transaction.transactionNumber - op2.transaction.transactionNumber
  );
  return orderedOperations;
};

const addControllerToPublicKey = (controller, publicKey) => {
  if (typeof publicKey === 'string' || Array.isArray(publicKey)) {
    return publicKey;
  }
  return {
    ...publicKey,
    controller: publicKey.controller || controller,
  };
};

const transformDidDocument = didDocument => {
  const transformProperties = [
    'assertionMethod',
    'authentication',
    'capabilityDelegation',
    'capabilityInvocation',
    'publicKey',
    'keyAgreement',
  ];
  const transformed = Object.entries(didDocument).reduce(
    (acc, [property, value]) => {
      if (transformProperties.includes(property)) {
        return {
          ...acc,
          [property]: value.map(pk =>
            addControllerToPublicKey(didDocument.id, pk)
          ),
        };
      }
      return {
        ...acc,
        [property]: value,
      };
    },
    {}
  );
  return transformed;
};

module.exports = {
  executeSequentially,
  encodeJson,
  decodeJson,
  payloadToHash,
  getDidUniqueSuffix,
  batchFileToOperations,
  signEncodedPayload,
  verifyOperationSignature,
  readThenWriteToCache,
  base58EncodedMultihashToBytes32,
  bytes32EnodedMultihashToBase58EncodedMultihash,
  objectToMultihash,
  toFullyQualifiedDidDocument,
  getOrderedOperations,
  addControllerToPublicKey,
  transformDidDocument,
};
