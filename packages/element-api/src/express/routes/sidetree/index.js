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
// FIXME schemas
router.post('/requests', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree-v2');
    sidetree.batchScheduler.writeNow(req.body);
    res.sendStatus(202);
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
    const sidetree = req.app.get('sidetree');
    await sidetree.sync();
    const result = await sidetree.db.readCollection('element:sidetree:did:documentRecord');
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
    const didUniqueSuffix = req.params.didUniqueSuffix.split(':').pop();
    const sidetree = req.app.get('sidetree-v2');
    const operations = await sidetree.db.readCollection(didUniqueSuffix);
    res.status(200).json(operations);
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
    const sidetree = req.app.get('sidetree-v2');
    const didDocument = await sidetree.resolve(did, true);
    res.status(200).json(didDocument);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
