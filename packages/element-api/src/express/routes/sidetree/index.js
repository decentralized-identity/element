const express = require('express');
const elementService = require('../../../lib/elementService');

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
    const result = await elementService.getNodeInfo();
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
 *   "/sidetree":
 *     get:
 *       description: Return sidetree from root.
 *       tags: [Sidetree]
 *       produces:
 *       - application/json
 *       responses:
 *         '200':
 *           description: All DID Documents and related model data
 *           schema:
 *              type: object
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await elementService.syncAll();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 *
 * paths:
 *   "/sidetree":
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
router.post('/', async (req, res, next) => {
  try {
    const { header, payload, signature } = req.body;
    const result = await elementService.processRequest({ header, payload, signature });
    res.status(200).json(result);
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
    const { did } = req.params;
    const result = await elementService.resolve(did);
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
    const result = await elementService.getRecord(did);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
