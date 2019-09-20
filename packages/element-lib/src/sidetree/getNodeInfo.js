module.exports = async (sidetree) => {
  // eslint-disable-next-line
  sidetree.getNodeInfo = async () => {
    const accounts = await sidetree.blockchain.web3.eth.getAccounts();
    // const data = await sidetree.storage.ipfs.version();
    return {
      // ipfs: data,
      ethereum: {
        anchor_contract_address: sidetree.blockchain.anchorContractAddress,
        accounts,
      },
      sidetree: sidetree.config,
    };
  };
};
