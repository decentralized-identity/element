module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.getOperations = async didUniqueSuffix => {
    let ops = await sidetree.db.readCollection('element:sidetree:operation');
    //   TODO: move into db query
    if (didUniqueSuffix) {
      ops = ops.filter(
        op => op.operation.operationHash === didUniqueSuffix
          || op.operation.decodedOperationPayload.didUniqueSuffix === didUniqueSuffix,
      );
    }
    //   eslint-disable-next-line
    return ops.sort((a, b) => a.transaction.transactionTime > b.transaction.transactionTime ? -1 : 1,);
  };
};
