const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');
const operationsToTransaction = require('../func/operationsToTransaction');

module.exports = (sidetree) => {
  //   TODO: add batching logic here..
  //   eslint-disable-next-line
  sidetree.createTransactionFromRequests = async requests => {
    const requestArray = Array.isArray(requests) ? requests : [requests];
    const operations = requestArray.map(requestBody => requestBodyToEncodedOperation(requestBody));
    return operationsToTransaction({
      operations,
      storage: sidetree.storage,
      blockchain: sidetree.blockchain,
    });
  };
};
