const express = require('express');

const router = express.Router();

router.get('/sync', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree-v2');
    await sidetree.sync();
    res.status(200).send({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/:did', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree-v2');
    const { did } = req.params;
    const didDocument = await sidetree.resolve(did);
    res.status(200).send(didDocument);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree-v2');
    const transaction = await sidetree.create(req.body);
    res.status(200).send(transaction);
  } catch (e) {
    next(e);
  }
});

// TODO: add Swaggee doc
// TODO: Use v2 prefix properly
router.get('/operations/:didUniqueSuffix', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree-v2');
    const { didUniqueSuffix } = req.params;
    const result = await sidetree.getOperations(didUniqueSuffix);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});
module.exports = router;
