const MerkleTools = require('merkle-tools');

const merkleTools = new MerkleTools({
  hashType: 'sha256', // optional, defaults to 'sha256'
});

module.exports = async ({ operations, storage }) => {
  const batchFile = {
    operations,
  };
  const batchFileHash = await storage.write(batchFile);
  merkleTools.addLeaves(operations, true);
  const doubleHash = false;
  merkleTools.makeTree(doubleHash);
  const root = merkleTools.getMerkleRoot();
  merkleTools.resetTree();
  const anchorFile = {
    batchFileHash,
    merkleRoot: root.toString('hex'),
  };
  const anchorFileHash = await storage.write(anchorFile);
  return anchorFileHash;
};
