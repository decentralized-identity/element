module.exports = async (sidetree) => {
  // eslint-disable-next-line
  sidetree.sync = async ({ fromTransactionTime, toTransactionTime }) => {
    sidetree.serviceBus.emit('element:sidetree:sync:start', {
      fromTransactionTime,
      toTransactionTime,
    });

    return new Promise(resolve => sidetree.serviceBus.on('element:sidetree:sync:stop', () => resolve()));
  };
};
