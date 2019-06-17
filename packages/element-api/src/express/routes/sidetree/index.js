const express = require('express');
const elementService = require('../../../lib/elementService');
const { sidetree, getSidetree, getNodeInfo } = require('../../../services/sidetree');

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
    await getSidetree();
    const result = await getNodeInfo();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree/batch":
 *     get:
 *       description: Return the current batch
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: A batch of operations to be anchored
 *           schema:
 *              type: object
 */
router.get('/batch', async (req, res, next) => {
  try {
    await getSidetree();
    const result = await elementService.getCurrentBatch();
    res.status(200).json(result);
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
    await getSidetree();
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
    await getSidetree();
    const { header, payload, signature } = req.body;
    sidetree.batchRequests([{ header, payload, signature }]);
    res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

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
    await getSidetree();
    const { did } = req.params;
    const result = await sidetree.resolve(did);
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
    await getSidetree();
    const { did } = req.params;
    const result = await sidetree.db.read(`element:sidetree:${did}`);
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
    await getSidetree();
    const { did } = req.params;
    const previousOperationHash = await sidetree.getPreviousOperationHash(did.split(':').pop());
    res.status(200).json({ previousOperationHash });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
