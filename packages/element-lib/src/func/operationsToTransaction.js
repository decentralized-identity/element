const operationsToAnchorFileHash = require('./operationsToAnchorFile');

module.exports = async ({ operations, storage, ledger }) => {
  const anchorFileHash = await operationsToAnchorFileHash({
    operations,
    storage,
  });

  return ledger.write(anchorFileHash);
};
