const base64url = require('base64url');
const MerkleTools = require('merkle-tools');

const merkleTools = new MerkleTools({
  hashType: 'sha256', // optional, defaults to 'sha256'
});

module.exports = ({ batchFile, operation }) => {
  const { operations } = batchFile;
  merkleTools.addLeaves(operations, true);
  const doubleHash = false;
  merkleTools.makeTree(doubleHash);
  const indexOfOp = operations.indexOf(operation);
  const proof = merkleTools.getProof(indexOfOp);
  merkleTools.resetTree();
  return base64url.encode(Buffer.from(JSON.stringify(proof)));
};
