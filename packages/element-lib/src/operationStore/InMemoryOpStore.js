class InMemoryOpStore {
  constructor() {
    this.operations = [];
  }

  addOperations(anchoredOperations) {
    const normalizedOperations = anchoredOperations.operations.map(op => ({
      ...op,
      transaction: anchoredOperations.txn,
    }));

    if (
      // eslint-disable-next-line
      this.operations.find(
        obj => obj.transaction.transactionNumber === anchoredOperations.txn.transactionNumber,
      )
    ) {
      return;
    }

    console.log('adding ops: ', anchoredOperations.operations);
    // eslint-disable-next-line
    this.operations = [...this.operations, ...normalizedOperations];
  }

  getOperationsForDIDUniqueSuffix(uid) {
    const anchoredOperations = [
      // eslint-disable-next-line
      ...this.operations,
    ].sort((a, b) => (a.transaction.transactionNumber > b.transaction.transactionNumber ? 1 : -1));

    // legacy support for bad syncAll
    if (!uid) {
      return anchoredOperations;
    }

    // eslint-disable-next-line
    return anchoredOperations.filter(
      op => op.operationHash === uid || op.decodedOperationPayload.didUniqueSuffix === uid,
    );
  }
}

module.exports = InMemoryOpStore;
