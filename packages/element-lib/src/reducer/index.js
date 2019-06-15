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
      sidetree.serviceBus.emit('element:sidetree:operation', {
        transaction,
        operation,
      });

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
