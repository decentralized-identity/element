const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.batchRequests = async requests => {
    const newRequests = Array.isArray(requests) ? requests : [requests];
    // todo: json schema validation of request bodies.
    // todo: signature validation
    const operations = newRequests.map(requestBody => requestBodyToEncodedOperation(requestBody));
    const currentBatch = await sidetree.db.read('element:sidetree:currentBatch');
    sidetree.startBatching();
    if (currentBatch && currentBatch.operations && currentBatch.operations.length) {
      currentBatch.operations = [...currentBatch.operations, ...operations];
      currentBatch.operations = Array.from(new Set(currentBatch.operations));
      return sidetree.db.write('element:sidetree:currentBatch', currentBatch);
    }
    return sidetree.db.write('element:sidetree:currentBatch', {
      operations,
    });
  };
};
