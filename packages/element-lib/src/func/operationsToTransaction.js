const operationsToAnchorFileHash = require('./operationsToAnchorFile');

module.exports = async ({ operations, storage, blockchain }) => {
  const anchorFileHash = await operationsToAnchorFileHash({
    operations,
    storage,
  });

  return blockchain.write(anchorFileHash);
};
