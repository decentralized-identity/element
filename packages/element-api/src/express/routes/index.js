const express = require('express');

const router = express.Router();

router.use('/version', require('./version'));

router.use('/sidetree', require('./sidetree'));

router.use('/sidetree-lite', require('./sidetree-lite'));

module.exports = router;
