module.exports = async (sidetree) => {
  // eslint-disable-next-line
  sidetree.sync = async args => {
    // todo: if synching, don't sync....
    let fromTransactionTime;
    let toTransactionTime;

    if (!args) {
      const lastSync = await sidetree.db.read('element:sidetree:sync');
      fromTransactionTime = lastSync && lastSync.syncStopDateTime
        ? lastSync.lastTransactionTime
        : 0;
      const currentTime = await sidetree.blockchain.getCurrentTime();
      toTransactionTime = currentTime.time;
    } else {
      ({ fromTransactionTime, toTransactionTime } = args);
    }

    sidetree.serviceBus.emit('element:sidetree:sync:start', {
      fromTransactionTime,
      toTransactionTime,
    });

    return new Promise(resolve => sidetree.serviceBus.on('element:sidetree:sync:stop', () => resolve()));
  };
};
