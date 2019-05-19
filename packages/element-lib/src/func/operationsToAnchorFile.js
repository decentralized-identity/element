const MerkleTools = require('merkle-tools');

const merkleTools = new MerkleTools({
  hashType: 'sha256', // optional, defaults to 'sha256'
});

const payloadToHash = require('./payloadToHash');
const decodeJson = require('./decodeJson');

const extractDidUniqueSuffixesFromDecodedOps = (decodedOperations) => {
  const didUniqueSuffixes = [];

  // didUniqueSuffix
  decodedOperations.forEach((op) => {
    switch (op.header.operation) {
      case 'create':
        didUniqueSuffixes.push(payloadToHash(op.decodedPayload));
        break;
      case 'update':
      case 'recover':
      case 'delete':
        didUniqueSuffixes.push(op.decodedPayload.didUniqueSuffix);
        break;
      default:
        throw Error(`Cannot extractDidUniqueSuffixesFromDecodedOps from: ${op.header.operation}`);
    }
  });

  return didUniqueSuffixes;
};

module.exports = async ({ operations, storage }) => {
  const batchFile = {
    operations,
  };

  let decodedOperations;
  let didUniqueSuffixes;

  try {
    decodedOperations = operations.map(decodeJson).map(op => ({
      ...op,
      decodedPayload: decodeJson(op.payload),
    }));
    didUniqueSuffixes = extractDidUniqueSuffixesFromDecodedOps(decodedOperations);
  } catch (e) {
    throw new Error('Operation encoding is not correct.');
  }

  const batchFileHash = await storage.write(batchFile);
  merkleTools.addLeaves(operations, true);
  const doubleHash = false;
  merkleTools.makeTree(doubleHash);
  const root = merkleTools.getMerkleRoot();
  merkleTools.resetTree();
  const anchorFile = {
    batchFileHash,
    didUniqueSuffixes,
    merkleRoot: root.toString('hex'),
  };
  const anchorFileHash = await storage.write(anchorFile);
  return anchorFileHash;
};
