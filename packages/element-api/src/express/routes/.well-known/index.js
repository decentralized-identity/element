const express = require('express');

const elementService = require('../../../lib/elementService');

const router = express.Router();

/**
 * @swagger
 *
 * paths:
 *   "/.well-known/webfinger":
 *     get:
 *       tags: [System]
 *       produces:
 *       - application/json
 *       parameters:
 *       - in: query
 *         name: resource
 *         description: resource to check
 *         required: true
 *         type: string
 *         value: acct:did:ghdid:transmute-industries~element-did~1bed11140547b8407478bdf2650db50a5a0c18ef2ae4caf20e818a9433923c2a@element-did.com
 *       responses:
 *         '200':
 *           description: Webfinger Record
 *           type: object
 */
router.get('/webfinger', async (req, res, next) => {
  try {
    const { resource } = req.query;
    if (!resource || !resource.includes('acct:')) {
      return res.status(400).json({
        message:
          'Please make sure "acct:DID@DOMAIN" is what you are sending as the "resource" query parameter.',
      });
    }
    const result = await getWebFingerRecord(resource);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
