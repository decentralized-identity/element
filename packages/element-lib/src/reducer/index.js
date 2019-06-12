const handlers = require('./handlers');

const reducer = async (state = {}, anchoredOperation, serviceBus) => {
  try {
    const { operation } = anchoredOperation.decodedOperation.header;
    // eslint-disable-next-line
    if (handlers[operation]) {
      // eslint-disable-next-line
      return await handlers[operation](state, anchoredOperation);
    }
    throw new Error('operation not supported');
  } catch (e) {
    if (serviceBus) {
      serviceBus.emit('element:sidetree:error', {
        error: e,
        anchoredOperation,
        state,
      });
    }

    return state;
  }
};

module.exports = reducer;
