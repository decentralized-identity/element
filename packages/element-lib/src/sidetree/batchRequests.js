const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');

module.exports = (sidetree) => {
  //   eslint-disable-next-line
  sidetree.batchRequests = async requests => {
    if (!Array.isArray(requests)) {
      //   eslint-disable-next-line
      requests = [requests];
    }
    // todo: json schema validation of request bodies.
    // todo: signature validation
    const operations = requests.map(requestBody => requestBodyToEncodedOperation(requestBody));

    const currentBatch = await sidetree.db.read('element:sidetree:currentBatch');
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
