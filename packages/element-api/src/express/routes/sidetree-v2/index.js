const express = require('express');
const { sync } = require('./service');

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

module.exports = router;
