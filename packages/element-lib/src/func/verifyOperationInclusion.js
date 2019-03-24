const crypto = require('crypto');
const base64url = require('base64url');
const MerkleTools = require('merkle-tools');

const merkleTools = new MerkleTools({
  hashType: 'sha256', // optional, defaults to 'sha256'
});

module.exports = ({ receipt, merkleRoot, operation }) => {
  const hash = crypto
    .createHash('sha256')
    .update(operation)
    .digest();

  const proof = JSON.parse(base64url.decode(receipt));
  return merkleTools.validateProof(proof, hash, merkleRoot);
};
