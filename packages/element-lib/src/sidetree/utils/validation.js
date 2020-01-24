// TODO: remove schema dependency
const schema = require('../../schema');

const isTransactionValid = transaction => {
  const valid = schema.validator.isValid(
    transaction,
    schema.schemas.sidetreeTransaction
  );
  if (!valid) {
    throw new Error('transaction not valid', transaction);
  }
  return valid;
};

const isAnchorFileValid = anchorFile => {
  const valid = schema.validator.isValid(
    anchorFile,
    schema.schemas.sidetreeAnchorFile
  );
  if (!valid) {
    throw new Error('anchorFile not valid', anchorFile);
  }
  return valid;
};

const isBatchFileValid = batchFile => {
  const valid = schema.validator.isValid(
    batchFile,
    schema.schemas.sidetreeBatchFile
  );
  if (!valid) {
    throw new Error('batchFile not valid', batchFile);
  }
  return valid;
};

const isKeyValid = key => {
  const valid = schema.validator.isValid(key, schema.schemas.sidetreeKey);
  if (!valid) {
    throw new Error('key is not valid', key);
  }
  return valid;
};

const isDidDocumentModelValid = didDocumentModel => {
  schema.validator.validate(
    didDocumentModel,
    schema.schemas.sidetreeDidDocumentModel,
    {
      throwError: true,
    }
  );

  return true;
};

module.exports = {
  isTransactionValid,
  isAnchorFileValid,
  isBatchFileValid,
  isKeyValid,
  isDidDocumentModelValid,
};
