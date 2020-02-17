const getNodeInfo = sidetree => async () => {
  // TODO: https://github.com/decentralized-identity/element/issues/91
  // expose manager pattern meta data about nodes

  // handle manager pattern properly.
  const ipfsData = sidetree.storage.ipfs
    ? await sidetree.storage.ipfs.version()
    : await sidetree.storage.storage.ipfs.version();

  return {
    ipfs: ipfsData,
    ethereum: {
      anchor_contract_address: sidetree.blockchain.anchorContractAddress,
    },
    sidetree: sidetree.parameters,
  };
};

module.exports = getNodeInfo;
