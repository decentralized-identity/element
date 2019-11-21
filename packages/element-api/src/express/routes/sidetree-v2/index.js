const express = require('express');
const { sync, resolve } = require('./service');

const router = express.Router();

router.get('/sync', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree');
    await sync(sidetree);
    res.status(200).send({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/resolve/:did', async (req, res, next) => {
  try {
    const sidetree = req.app.get('sidetree');
    const { did } = req.params;
    const didDocument = await resolve(sidetree, did);
    res.status(200).send(didDocument);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
