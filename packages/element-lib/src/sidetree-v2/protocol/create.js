const MerkleTools = require('merkle-tools');
const { encodeJson, getDidUniqueSuffix, syncTransaction } = require('../func');

// TODO deterministic stringify
const create = sidetree => async (req) => {
  const requests = Array.isArray(req) ? req : [req];
  const operations = requests.map(encodeJson);

  // Write batchFile to storage
  const batchFile = {
    operations,
  };
  const batchFileHash = await sidetree.storage.write(batchFile);

  // Write anchorFile to storage
  const didUniqueSuffixes = requests.map(getDidUniqueSuffix);
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
  const transaction = await sidetree.blockchain.write(anchorFileHash);

  // sync transaction to cache;
  await syncTransaction(sidetree, transaction);
  return transaction;
};

module.exports = create;
