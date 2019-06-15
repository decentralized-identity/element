module.exports = (sidetree) => {
  sidetree.serviceBus.on('element:sidetree:error:badTransaction', async ({ transaction }) => {
    console.warn('bad transaction', transaction);
  });
};
