const requestBodyToEncodedOperation = require('../func/requestBodyToEncodedOperation');
const operationsToTransaction = require('../func/operationsToTransaction');

module.exports = (sidetree) => {
  //   TODO: add batching logic here..
  //   eslint-disable-next-line
  sidetree.createTransactionFromRequests = async requests => {
    if (!Array.isArray(requests)) {
      //   eslint-disable-next-line
      requests = [requests];
    }
    const operations = requests.map(requestBody => requestBodyToEncodedOperation(requestBody));
    return operationsToTransaction({
      operations,
      storage: sidetree.storage,
      blockchain: sidetree.blockchain,
    });
  };
};
