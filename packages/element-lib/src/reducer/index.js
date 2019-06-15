const handlers = require('./handlers');

const reducer = async (state = {}, anchoredOperation, sidetree) => {
  try {
    const { transaction, operation } = anchoredOperation;
    const type = operation.decodedOperation.header.operation;
    const operationHandler = handlers[type];
    // eslint-disable-next-line
    if (operationHandler) {
      // eslint-disable-next-line
      const nextState = await operationHandler(state, anchoredOperation);

      // only persist valid operations.
      try {
        await sidetree.db.write(`element:sidetree:operation:${operation.operationHash}`, {
          type: 'element:sidetree:operation',
          transaction,
          operation,
        });
      } catch (e) {
        if (e.status === 409) {
          // Document update conflict
          // Meaning we already have this operation.
          // No OP
        } else {
          console.warn(e);
        }
      }
      return nextState;
    }
    throw new Error('operation not supported');
  } catch (e) {
    if (sidetree) {
      sidetree.serviceBus.emit('element:sidetree:error:badOperation', {
        operation: anchoredOperation,
        reason: e,
      });
    }

    return state;
  }
};

module.exports = reducer;
