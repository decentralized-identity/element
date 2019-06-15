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
      sidetree.serviceBus.emit('element:sidetree:error', {
        error: e,
        details: anchoredOperation,
      });
    }

    return state;
  }
};

module.exports = reducer;
