const express = require('express');

const router = express.Router();

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/node":
 *     get:
 *       description: Return summary of node
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: Node information
 *           schema:
 *              type: object
 */
router.get('/node', async (req, res, next) => {
  try {
    const result = await req.app.get('sidetree').getNodeInfo();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/requests":
 *     post:
 *       description: Publish Sidetree Operation
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       parameters:
 *         - name: operationBindingModel
 *           in: body
 *           required: true
 *           schema:
 *             "$ref": "#/definitions/#operationBindingModel"
 *       responses:
 *         '200':
 *           description: Operation Accepted
 *           schema:
 *              type: object
 */
router.post('/requests', async (req, res, next) => {
  try {
    const { header, payload, signature } = req.body;
    req.app.get('sidetree').batchRequests([{ header, payload, signature }]);
    res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/docs":
 *     get:
 *       description: Return all sidetree did records.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: All DID Documents and related model data
 *           schema:
 *              type: object
 */
router.get('/docs', async (req, res, next) => {
  try {
    const result = await req.app
      .get('sidetree')
      .db.readCollection('element:sidetree:did:documentRecord');
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/transactions":
 *     get:
 *       description: Return sidetree transactions.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: sidetree transactions.
 */
router.get('/transactions', async (req, res, next) => {
  try {
    const result = await req.app.get('sidetree').getTransactions(req.query);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/transaction/{transactionTimeHash}":
 *     get:
 *       description: Return summary of transactionTimeHash.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: sidetree transaction summary.
 */
router.get('/transaction/:transactionTimeHash/summary', async (req, res, next) => {
  try {
    const { transactionTimeHash } = req.params;
    const result = await req.app.get('sidetree').getTransactionSummary(transactionTimeHash);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/operations":
 *     get:
 *       description: Return all operations.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: sidetree operations.
 */
router.get('/operations', async (req, res, next) => {
  try {
    const result = await req.app.get('sidetree').getOperations();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/operations/{didUniqueSuffix}":
 *     get:
 *       description: Return all operations for a didUniqueSuffix.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: sidetree operations.
 */
router.get('/operations/:didUniqueSuffix', async (req, res, next) => {
  try {
    const { didUniqueSuffix } = req.params;
    const result = await req.app.get('sidetree').getOperations(didUniqueSuffix);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

// BEWARE /sidetree/:did * MUST BE LAST.

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/{did}":
 *     get:
 *       description: Resolve a DID
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       parameters:
 *       - in: path
 *         name: did
 *         description: DID to resolve
 *         required: true
 *         type: string
 *       responses:
 *         '200':
 *           description: A JSON-LD DID Document
 *           schema:
 *             "$ref": "#/definitions/#didDoc"
 */
router.get('/:did', async (req, res, next) => {
  try {
    const { did } = req.params;
    const result = await req.app.get('sidetree').resolveWithRetry(did, 5);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/{did}/record":
 *     get:
 *       description: Get a sidetree record for a given DID.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       parameters:
 *       - in: path
 *         name: did
 *         description: DID to resolve
 *         required: true
 *         type: string
 *       responses:
 *         '200':
 *           description: A sidetree record.
 */
router.get('/:did/record', async (req, res, next) => {
  try {
    const { did } = req.params;
    const result = await req.app.get('sidetree').db.read(`element:sidetree:${did}`);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/{did}/previousOperationHash":
 *     get:
 *       description: Return the previousOperationHash.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         type: string
 *       responses:
 *         '200':
 *           description: A Sidetree operation hash.
 */
router.get('/:did/previousOperationHash', async (req, res, next) => {
  try {
    const { did } = req.params;
    const previousOperationHash = await req.app
      .get('sidetree')
      .getPreviousOperationHash(did.split(':').pop());
    res.status(200).json({ previousOperationHash });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
