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
    console.log('Operation rejected', JSON.stringify(anchoredOperation.decodedOperationPayload, null, 2));
    console.log('Sidetree: ', JSON.stringify(state, null, 2));
    console.log(e);
    throw new Error(e);
  }
};

module.exports = reducer;
