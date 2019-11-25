const express = require('express');

const router = express.Router();

router.get('/sync', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree');
    await sidetree.sync();
    res.status(200).send({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/:did', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree');
    const { did } = req.params;
    const didDocument = await sidetree.resolve(did);
    res.status(200).send(didDocument);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
