const handlers = require('./handlers');

const reducer = async (state = {}, anchoredOperation, sidetree) => {
  try {
    const { operation } = anchoredOperation.decodedOperation.header;
    // eslint-disable-next-line
    if (handlers[operation]) {
      // eslint-disable-next-line
      return await handlers[operation](state, anchoredOperation);
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
