const handlers = require('./handlers');

const reducer = async (state = {}, anchoredOperation) => {
  try {
    const { operation } = anchoredOperation.decodedOperation.header;
    // eslint-disable-next-line
    if (handlers[operation]) {
      // eslint-disable-next-line
      return await handlers[operation](state, anchoredOperation);
    }
    throw new Error('operation not supported');
  } catch (e) {
    console.warn('Operation rejected', e);
    console.warn('Operation: ', anchoredOperation);
    console.warn('State: ', state);
    return state;
  }
};

module.exports = reducer;
