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

    return ops;
  };
};
