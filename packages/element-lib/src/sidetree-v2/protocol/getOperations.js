const getOperations = sidetree => async (didUniqueSuffix) => {
  const operations = await sidetree.db.readCollection(didUniqueSuffix);
  operations.sort((op1, op2) => op1.transactionNumber > op2.transactionNumber);
  return operations;
};

module.exports = getOperations;
