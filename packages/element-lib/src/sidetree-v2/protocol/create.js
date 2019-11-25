const base64url = require('base64url');
const MerkleTools = require('merkle-tools');
const crypto = require('crypto');

// TODO deterministic stringify
const encodeJson = payload => base64url.encode(Buffer.from(JSON.stringify(payload)));

const decodeJson = encodedPayload => JSON.parse(base64url.decode(encodedPayload));

const payloadToHash = (payload) => {
  const encodedPayload = encodeJson(payload);
  return base64url.encode(
    crypto
      .createHash('sha256')
      .update(base64url.toBuffer(encodedPayload))
      .digest(),
  );
};

const getDidUniqueSuffix = (decodedOperation) => {
  switch (decodedOperation.header.operation) {
    case 'create':
      return payloadToHash(decodedOperation.decodedPayload);
    case 'update':
    case 'recover':
    case 'delete':
      return decodedOperation.decodedPayload.didUniqueSuffix;
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${decodedOperation}`);
  }
};

const create = sidetree => async (req) => {
  const requests = Array.isArray(req) ? req : [req];
  const operations = requests.map(encodeJson);
  console.log({ operations });

  // Write batchFile to storage
  const batchFile = {
    operations,
  };
  const batchFileHash = await sidetree.storage.write(batchFile);

  // Write anchorFile to storage
  const decodedOperations = requests.map(op => ({
    ...op,
    decodedPayload: decodeJson(op.payload),
  }));
  const didUniqueSuffixes = decodedOperations.map(getDidUniqueSuffix);

  const merkleTools = new MerkleTools({
    hashType: 'sha256', // optional, defaults to 'sha256'
  });
  merkleTools.addLeaves(operations, true);
  merkleTools.makeTree(false);
  const root = merkleTools.getMerkleRoot();
  merkleTools.resetTree();
  const anchorFile = {
    batchFileHash,
    didUniqueSuffixes,
    merkleRoot: root.toString('hex'),
  };
  const anchorFileHash = await sidetree.storage.write(anchorFile);

  // Anchor on ethereum
  return sidetree.blockchain.write(anchorFileHash);
};

module.exports = create;
