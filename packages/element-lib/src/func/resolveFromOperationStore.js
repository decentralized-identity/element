const resolveFromOperationStore = async (opStore, reducer, did) => {
  let anchoredOperations;
  let uid;
  if (did) {
    uid = did.split(':').pop();
    anchoredOperations = await opStore.getOperationsForDIDUniqueSuffix(uid);
  } else {
    // legacy support to be removed.
    anchoredOperations = await opStore.getOperationsForDIDUniqueSuffix();
  }

  let updatedState = {};

  // not sure this is correct...
  if (!anchoredOperations.length) {
    return null;
  }
  // eslint-disable-next-line
  for (const anchoredOperation of anchoredOperations) {
    // eslint-disable-next-line
    updatedState = { ...(await reducer(updatedState, anchoredOperation)) };
  }
  if (did) {
    return updatedState[uid];
  }

  const lastTxn = anchoredOperations.pop().transaction;
  updatedState.transactionTime = lastTxn.transactionTime;

  return updatedState;
};

module.exports = resolveFromOperationStore;
