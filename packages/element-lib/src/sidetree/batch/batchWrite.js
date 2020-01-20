const MerkleTools = require('merkle-tools');
const { encodeJson, getDidUniqueSuffix } = require('../../func');

const batchWrite = sidetree => async () => {
  // Get the batch of operations to be anchored on the blockchain.
  const { maxOperationsPerBatch } = sidetree.parameters;
  const decodedOperations = await sidetree.operationQueue.peek(
    maxOperationsPerBatch
  );

  // Do nothing if there is nothing to batch together.
  if (decodedOperations.length === 0) {
    return null;
  }

  const operations = decodedOperations.map(encodeJson);

  // Write batchFile to storage
  const batchFile = {
    operations,
  };
  const batchFileHash = await sidetree.storage.write(batchFile);

  // Write anchorFile to storage
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
  const transaction = await sidetree.blockchain.write(anchorFileHash);

  // Remove written operations from queue if batch writing is successful.
  await sidetree.operationQueue.dequeue(decodedOperations.length);

  return transaction;
};

module.exports = batchWrite;
